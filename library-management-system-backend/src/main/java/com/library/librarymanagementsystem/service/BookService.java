package com.library.librarymanagementsystem.service;



import com.library.librarymanagementsystem.dto.request.AddStockRequest;
import com.library.librarymanagementsystem.dto.request.BookRequest;
import com.library.librarymanagementsystem.dto.request.BookUpdateRequest;
import com.library.librarymanagementsystem.dto.request.RemoveStockRequest;
import com.library.librarymanagementsystem.dto.response.BookImportResponse;
import com.library.librarymanagementsystem.dto.response.BookResponse;
import com.library.librarymanagementsystem.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BookService {

    BookResponse createBook(BookRequest request);

    List<BookResponse> getAllBooks();

    BookResponse getBookById(Long id);

    BookResponse updateBook(Long id, BookUpdateRequest request);

    BookImportResponse importBooks(MultipartFile file);

    void deleteBook(Long id);

    List<BookResponse> searchBooksByTitle(String title);

    List<BookResponse> getBooksByCategory(String category);

    List<BookResponse> getAvailableBooks();

    PageResponse<BookResponse> getAllBooks(Pageable pageable);

    BookResponse addStock(Long bookId, AddStockRequest request);

    BookResponse removeStock(Long bookId, RemoveStockRequest request);


}
