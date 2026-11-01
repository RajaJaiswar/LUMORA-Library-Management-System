package com.library.librarymanagementsystem.service.Impl;

import com.library.librarymanagementsystem.dto.request.AddStockRequest;
import com.library.librarymanagementsystem.dto.request.BookRequest;
import com.library.librarymanagementsystem.dto.request.BookUpdateRequest;
import com.library.librarymanagementsystem.dto.request.RemoveStockRequest;
import com.library.librarymanagementsystem.dto.response.BookImportError;
import com.library.librarymanagementsystem.dto.response.BookImportResponse;
import com.library.librarymanagementsystem.dto.response.BookResponse;
import com.library.librarymanagementsystem.dto.response.PageResponse;
import com.library.librarymanagementsystem.entity.Book;

import com.library.librarymanagementsystem.exception.BookDeletionException;
import com.library.librarymanagementsystem.exception.ResourceAlreadyExistsException;
import com.library.librarymanagementsystem.exception.ResourceNotFoundException;
import com.library.librarymanagementsystem.exception.StockOperationException;
import com.library.librarymanagementsystem.repository.BookRepository;

import com.library.librarymanagementsystem.repository.BorrowRecordRepository;
import com.library.librarymanagementsystem.service.BookService;

import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;


    @Override
    public BookResponse createBook(BookRequest request) {

        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new ResourceAlreadyExistsException(
                    "Book with ISBN already exists"
            );
        }

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .availableQuantity(request.getQuantity())
                .build();

        Book savedBook = bookRepository.save(book);

        return mapToResponse(savedBook);
    }

    @Override
    public List<BookResponse> getAllBooks() {

        return bookRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookResponse getBookById(Long id) {

        Book book = getBook(id);

        return mapToResponse(book);
    }

    @Override
    @Transactional
    public BookResponse updateBook(
            Long id,
            BookUpdateRequest request) {

        Book book = getBook(id);

        if (!book.getIsbn().equals(request.getIsbn())
                && bookRepository.existsByIsbn(request.getIsbn())) {

            throw new ResourceAlreadyExistsException(
                    "Book with ISBN already exists"
            );
        }

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setCategory(request.getCategory());

        Book updatedBook = bookRepository.save(book);

        return mapToResponse(updatedBook);
    }

    @Override
    public void deleteBook(Long id) {

        Book book = getBook(id);

        if (borrowRecordRepository.existsByBook(book)) {
            throw new BookDeletionException(
                    "Book cannot be deleted because it has borrowing history"
            );
        }

        bookRepository.delete(book);
    }

    private Book getBook(Long id) {

        return bookRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Book not found with id: " + id
                        )
                );
    }

    private BookResponse mapToResponse(Book book) {

        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .category(book.getCategory())
                .quantity(book.getQuantity())
                .availableQuantity(book.getAvailableQuantity())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> searchBooksByTitle(String title) {

        return bookRepository.findByTitleContainingIgnoreCase(title)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getBooksByCategory(String category) {

        return bookRepository.findByCategoryIgnoreCase(category)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getAvailableBooks() {

        return bookRepository.findByAvailableQuantityGreaterThan(0)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<BookResponse> getAllBooks(Pageable pageable) {

        Page<Book> bookPage = bookRepository.findAll(pageable);

        List<BookResponse> content = bookPage.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                bookPage.getNumber(),
                bookPage.getSize(),
                bookPage.getTotalElements(),
                bookPage.getTotalPages(),
                bookPage.isFirst(),
                bookPage.isLast()
        );
    }

    @Override
    @Transactional
    public BookImportResponse importBooks(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty");
        }

        List<BookImportError> errors = new ArrayList<>();

        /*
         * Keeps valid CSV rows indexed by ISBN.
         *
         * LinkedHashMap preserves CSV order.
         */
        Map<String, CSVRecord> validRecordsByIsbn = new LinkedHashMap<>();

        int totalRows = 0;
        int created = 0;
        int updated = 0;
        int unchanged = 0;

        try (
                Reader reader = new BufferedReader(
                        new InputStreamReader(
                                file.getInputStream(),
                                StandardCharsets.UTF_8
                        )
                );

                CSVParser csvParser = CSVFormat.DEFAULT
                        .builder()
                        .setHeader()
                        .setSkipHeaderRecord(true)
                        .setIgnoreEmptyLines(true)
                        .setTrim(true)
                        .build()
                        .parse(reader)
        ) {

            /*
             * STEP 1:
             * Read and validate CSV rows.
             */
            for (CSVRecord record : csvParser.getRecords()) {

                totalRows++;

                int rowNumber =
                        (int) record.getRecordNumber() + 1;

                String title = record.get("title");
                String author = record.get("author");
                String isbn = record.get("isbn");
                String category = record.get("category");
                String quantityText = record.get("quantity");

                // -------------------------
                // Validate title
                // -------------------------
                if (title == null || title.isBlank()) {
                    errors.add(
                            new BookImportError(
                                    rowNumber,
                                    "Title is required"
                            )
                    );
                    continue;
                }

                title = title.trim();

                // -------------------------
                // Validate ISBN
                // -------------------------
                if (isbn == null || isbn.isBlank()) {
                    errors.add(
                            new BookImportError(
                                    rowNumber,
                                    "ISBN is required"
                            )
                    );
                    continue;
                }

                isbn = isbn.trim();

                // -------------------------
                // Validate category
                // -------------------------
                if (category == null || category.isBlank()) {
                    errors.add(
                            new BookImportError(
                                    rowNumber,
                                    "Category is required"
                            )
                    );
                    continue;
                }

                category = category.trim();

                // -------------------------
                // Validate quantity
                // -------------------------
                if (quantityText == null || quantityText.isBlank()) {
                    errors.add(
                            new BookImportError(
                                    rowNumber,
                                    "Quantity is required"
                            )
                    );
                    continue;
                }

                int quantity;

                try {
                    quantity = Integer.parseInt(
                            quantityText.trim()
                    );
                } catch (NumberFormatException ex) {

                    errors.add(
                            new BookImportError(
                                    rowNumber,
                                    "Quantity must be a valid number"
                            )
                    );

                    continue;
                }

                if (quantity <= 0) {
                    errors.add(
                            new BookImportError(
                                    rowNumber,
                                    "Quantity must be greater than 0"
                            )
                    );

                    continue;
                }

                // -------------------------
                // Duplicate ISBN in CSV
                // -------------------------
                if (validRecordsByIsbn.containsKey(isbn)) {

                    errors.add(
                            new BookImportError(
                                    rowNumber,
                                    "Duplicate ISBN in CSV: " + isbn
                            )
                    );

                    continue;
                }

                validRecordsByIsbn.put(isbn, record);
            }

            /*
             * STEP 2:
             * Fetch all existing books in one query.
             */
            Map<String, Book> existingBooksByIsbn =
                    new HashMap<>();

            if (!validRecordsByIsbn.isEmpty()) {

                List<Book> existingBooks =
                        bookRepository.findAllByIsbnIn(
                                validRecordsByIsbn.keySet()
                        );

                for (Book book : existingBooks) {
                    existingBooksByIsbn.put(
                            book.getIsbn(),
                            book
                    );
                }
            }

            /*
             * STEP 3:
             * Process valid CSV records.
             */
            List<Book> booksToSave = new ArrayList<>();

            for (Map.Entry<String, CSVRecord> entry
                    : validRecordsByIsbn.entrySet()) {

                String isbn = entry.getKey();
                CSVRecord record = entry.getValue();

                int rowNumber =
                        (int) record.getRecordNumber() + 1;

                String title =
                        record.get("title").trim();

                String author =
                        record.get("author");

                author =
                        author == null || author.isBlank()
                                ? null
                                : author.trim();

                String category =
                        record.get("category").trim();

                int quantity =
                        Integer.parseInt(
                                record.get("quantity").trim()
                        );

                Book existingBook =
                        existingBooksByIsbn.get(isbn);

                /*
                 * ------------------------------------
                 * NEW BOOK
                 * ------------------------------------
                 */
                if (existingBook == null) {

                    Book newBook = Book.builder()
                            .title(title)
                            .author(author)
                            .isbn(isbn)
                            .category(category)
                            .quantity(quantity)
                            .availableQuantity(quantity)
                            .build();

                    booksToSave.add(newBook);

                    created++;

                    continue;
                }

                /*
                 * ------------------------------------
                 * EXISTING BOOK
                 * ------------------------------------
                 *
                 * IMPORTANT:
                 *
                 * CSV does NOT modify:
                 *
                 * - quantity
                 * - availableQuantity
                 *
                 * Inventory is managed separately.
                 */

                boolean titleChanged =
                        !Objects.equals(
                                existingBook.getTitle(),
                                title
                        );

                boolean authorChanged =
                        !Objects.equals(
                                existingBook.getAuthor(),
                                author
                        );

                boolean categoryChanged =
                        !Objects.equals(
                                existingBook.getCategory(),
                                category
                        );

                /*
                 * Nothing changed in catalog information.
                 */
                if (!titleChanged
                        && !authorChanged
                        && !categoryChanged) {

                    unchanged++;

                    continue;
                }

                /*
                 * Update catalog information only.
                 */
                if (titleChanged) {
                    existingBook.setTitle(title);
                }

                if (authorChanged) {
                    existingBook.setAuthor(author);
                }

                if (categoryChanged) {
                    existingBook.setCategory(category);
                }

                booksToSave.add(existingBook);

                updated++;
            }

            /*
             * STEP 4:
             * Save new and modified books.
             */
            if (!booksToSave.isEmpty()) {
                bookRepository.saveAll(booksToSave);
            }

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to read CSV file",
                    e
            );
        }

        return new BookImportResponse(
                totalRows,
                created,
                updated,
                unchanged,
                errors.size(),
                errors
        );
    }

    @Override
    @Transactional
    public BookResponse addStock(
            Long bookId,
            AddStockRequest request) {

        Book book = bookRepository.findByIdForUpdate(bookId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Book not found with id: " + bookId
                        )
                );

        int addedQuantity = request.getQuantity();

        book.setQuantity(
                book.getQuantity() + addedQuantity
        );

        book.setAvailableQuantity(
                book.getAvailableQuantity() + addedQuantity
        );

        Book updatedBook = bookRepository.save(book);

        return mapToResponse(updatedBook);
    }

    @Transactional
    @Override
    public BookResponse removeStock(Long bookId, RemoveStockRequest request) {

        Book book = bookRepository.findByIdForUpdate(bookId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Book not found with id: " + bookId
                        )
                );

        int removeQuantity = request.getQuantity();
        int availableQuantity = book.getAvailableQuantity();

        if (removeQuantity > availableQuantity) {
            throw new StockOperationException(
                    "Cannot remove " + removeQuantity +
                            " copies. Only " + availableQuantity +
                            " copies are currently available."
            );
        }

        book.setQuantity(book.getQuantity() - removeQuantity);
        book.setAvailableQuantity(
                book.getAvailableQuantity() - removeQuantity
        );

        Book updatedBook = bookRepository.save(book);

        return mapToResponse(updatedBook);
    }

}
