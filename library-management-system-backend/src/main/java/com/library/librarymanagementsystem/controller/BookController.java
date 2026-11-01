package com.library.librarymanagementsystem.controller;

import com.library.librarymanagementsystem.dto.request.AddStockRequest;
import com.library.librarymanagementsystem.dto.request.BookRequest;
import com.library.librarymanagementsystem.dto.request.BookUpdateRequest;
import com.library.librarymanagementsystem.dto.request.RemoveStockRequest;
import com.library.librarymanagementsystem.dto.response.BookImportResponse;
import com.library.librarymanagementsystem.dto.response.BookResponse;
import com.library.librarymanagementsystem.dto.response.PageResponse;
import com.library.librarymanagementsystem.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;


    // ==================== GET ALL BOOKS ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN', 'MEMBER')")
    public ResponseEntity<PageResponse<BookResponse>> getAllBooks(
            @PageableDefault(
                    size = 20,
                    sort = "id",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        return ResponseEntity.ok(
                bookService.getAllBooks(pageable)
        );
    }


    // ==================== SEARCH & FILTER ====================

    @GetMapping("/search")
    public ResponseEntity<List<BookResponse>> searchBooks(
            @RequestParam String title) {

        return ResponseEntity.ok(
                bookService.searchBooksByTitle(title)
        );
    }


    @GetMapping("/category/{category}")
    public ResponseEntity<List<BookResponse>> getBooksByCategory(
            @PathVariable String category) {

        return ResponseEntity.ok(
                bookService.getBooksByCategory(category)
        );
    }


    @GetMapping("/available")
    public ResponseEntity<List<BookResponse>> getAvailableBooks() {

        return ResponseEntity.ok(
                bookService.getAvailableBooks()
        );
    }




    // ==================== GET BOOK BY ID ====================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN', 'MEMBER')")
    public ResponseEntity<BookResponse> getBookById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                bookService.getBookById(id)
        );
    }


    // ==================== CREATE BOOK ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<BookResponse> createBook(
            @Valid @RequestBody BookRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bookService.createBook(request));
    }

    @PostMapping(
            value = "/import",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<BookImportResponse> importBooks(
            @RequestParam("file") MultipartFile file) {

        return ResponseEntity.ok(
                bookService.importBooks(file)
        );
    }

    @PostMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<BookResponse> addStock(
            @PathVariable Long id,
            @Valid @RequestBody AddStockRequest request) {

        return ResponseEntity.ok(
                bookService.addStock(id, request)
        );
    }

    @PostMapping("/{id}/stock/remove")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<BookResponse> removeStock(
            @PathVariable Long id,
            @Valid @RequestBody RemoveStockRequest request) {

        return ResponseEntity.ok(
                bookService.removeStock(id, request)
        );
    }


    // ==================== UPDATE BOOK ====================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookUpdateRequest request) {

        return ResponseEntity.ok(
                bookService.updateBook(id, request)
        );
    }


    // ==================== DELETE BOOK ====================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<Void> deleteBook(
            @PathVariable Long id) {

        bookService.deleteBook(id);

        return ResponseEntity.noContent().build();
    }
}