package com.library.librarymanagementsystem.service;

import com.library.librarymanagementsystem.dto.request.AddStockRequest;
import com.library.librarymanagementsystem.dto.request.BookUpdateRequest;
import com.library.librarymanagementsystem.dto.request.RemoveStockRequest;
import com.library.librarymanagementsystem.dto.response.BookResponse;
import com.library.librarymanagementsystem.entity.Book;
import com.library.librarymanagementsystem.exception.StockOperationException;
import com.library.librarymanagementsystem.repository.BookRepository;
import com.library.librarymanagementsystem.repository.BorrowRecordRepository;
import com.library.librarymanagementsystem.service.Impl.BookServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookServiceUnitTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private BorrowRecordRepository borrowRecordRepository;

    @InjectMocks
    private BookServiceImpl bookService;

    private Book testBook;

    @BeforeEach
    void setUp() {
        testBook = Book.builder()
                .id(1L)
                .title("Concurrency in Practice")
                .author("Brian Goetz")
                .isbn("978-0321349606")
                .category("Programming")
                .quantity(10)
                .availableQuantity(10)
                .build();
    }

    @Test
    void addStock_Success_UsesPessimisticLock() {
        when(bookRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(testBook));
        when(bookRepository.save(any(Book.class))).thenAnswer(i -> i.getArgument(0));

        AddStockRequest request = new AddStockRequest();
        request.setQuantity(5);

        BookResponse response = bookService.addStock(1L, request);

        assertNotNull(response);
        assertEquals(15, response.getQuantity());
        assertEquals(15, response.getAvailableQuantity());
        verify(bookRepository).findByIdForUpdate(1L);
        verify(bookRepository).save(testBook);
    }

    @Test
    void removeStock_Success_UsesPessimisticLock() {
        when(bookRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(testBook));
        when(bookRepository.save(any(Book.class))).thenAnswer(i -> i.getArgument(0));

        RemoveStockRequest request = new RemoveStockRequest();
        request.setQuantity(4);

        BookResponse response = bookService.removeStock(1L, request);

        assertNotNull(response);
        assertEquals(6, response.getQuantity());
        assertEquals(6, response.getAvailableQuantity());
        verify(bookRepository).findByIdForUpdate(1L);
        verify(bookRepository).save(testBook);
    }

    @Test
    void removeStock_InsufficientStock_ThrowsStockOperationException() {
        when(bookRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(testBook));

        RemoveStockRequest request = new RemoveStockRequest();
        request.setQuantity(15); // More than 10 available

        StockOperationException ex = assertThrows(StockOperationException.class, () ->
                bookService.removeStock(1L, request)
        );

        assertTrue(ex.getMessage().contains("Cannot remove 15 copies"));
        verify(bookRepository).findByIdForUpdate(1L);
        verify(bookRepository, never()).save(any());
    }

    @Test
    void updateBook_Success() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(bookRepository.save(any(Book.class))).thenAnswer(i -> i.getArgument(0));

        BookUpdateRequest request = new BookUpdateRequest();
        request.setTitle("Updated Title");
        request.setAuthor("Updated Author");
        request.setIsbn("978-0321349606"); // same ISBN
        request.setCategory("Tech");

        BookResponse response = bookService.updateBook(1L, request);

        assertNotNull(response);
        assertEquals("Updated Title", response.getTitle());
        assertEquals("Updated Author", response.getAuthor());
        assertEquals(10, response.getQuantity()); // Inventory untouched
        assertEquals(10, response.getAvailableQuantity());
        verify(bookRepository).save(testBook);
    }
}
