package com.library.librarymanagementsystem.service;

import com.library.librarymanagementsystem.dto.response.ReturnRequestResponse;
import com.library.librarymanagementsystem.entity.*;
import com.library.librarymanagementsystem.exception.ResourceNotFoundException;
import com.library.librarymanagementsystem.repository.BookRepository;
import com.library.librarymanagementsystem.repository.BorrowRecordRepository;
import com.library.librarymanagementsystem.repository.ReturnRequestRepository;
import com.library.librarymanagementsystem.repository.UserRepository;
import com.library.librarymanagementsystem.service.Impl.ReturnRequestServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReturnRequestServiceTest {

    @Mock
    private ReturnRequestRepository returnRequestRepository;

    @Mock
    private BorrowRecordRepository borrowRecordRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private ReturnRequestServiceImpl returnRequestService;

    private User member;
    private User anotherMember;
    private User librarian;
    private Book book;
    private BorrowRecord borrowRecord;
    private ReturnRequestRecord pendingReturnRequest;

    @BeforeEach
    void setUp() {
        member = User.builder()
                .id(1L)
                .name("Student User")
                .email("student@college.test")
                .role(Role.MEMBER)
                .build();

        anotherMember = User.builder()
                .id(2L)
                .name("Other Student")
                .email("other@college.test")
                .role(Role.MEMBER)
                .build();

        librarian = User.builder()
                .id(3L)
                .name("Librarian User")
                .email("librarian@college.test")
                .role(Role.LIBRARIAN)
                .build();

        book = Book.builder()
                .id(10L)
                .title("Clean Code")
                .isbn("978-0132350884")
                .quantity(10)
                .availableQuantity(9)
                .build();

        borrowRecord = BorrowRecord.builder()
                .id(50L)
                .user(member)
                .book(book)
                .issueDate(LocalDate.now().minusDays(5))
                .dueDate(LocalDate.now().plusDays(9))
                .status(BorrowStatus.BORROWED)
                .fine(0.0)
                .extensionCount(0)
                .build();

        pendingReturnRequest = ReturnRequestRecord.builder()
                .id(200L)
                .borrowRecord(borrowRecord)
                .status(ReturnRequestStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void cancelReturnRequest_Success() {
        when(userRepository.findByEmail("student@college.test")).thenReturn(Optional.of(member));
        when(returnRequestRepository.findByIdForUpdate(200L)).thenReturn(Optional.of(pendingReturnRequest));
        when(returnRequestRepository.save(any(ReturnRequestRecord.class))).thenAnswer(i -> i.getArgument(0));

        ReturnRequestResponse response = returnRequestService.cancelReturnRequest(200L, "student@college.test");

        assertNotNull(response);
        assertEquals(ReturnRequestStatus.CANCELLED, response.getStatus());
        assertNotNull(response.getProcessedAt());
        verify(returnRequestRepository).save(pendingReturnRequest);
        // Assert loan and book were not modified
        assertEquals(BorrowStatus.BORROWED, borrowRecord.getStatus());
        verify(borrowRecordRepository, never()).save(any());
        verify(bookRepository, never()).save(any());
    }

    @Test
    void cancelReturnRequest_AnotherUser_ThrowsIllegalArgumentException() {
        when(userRepository.findByEmail("other@college.test")).thenReturn(Optional.of(anotherMember));
        when(returnRequestRepository.findByIdForUpdate(200L)).thenReturn(Optional.of(pendingReturnRequest));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                returnRequestService.cancelReturnRequest(200L, "other@college.test")
        );

        assertEquals("You cannot cancel another user's return request", ex.getMessage());
        verify(returnRequestRepository, never()).save(any());
    }

    @Test
    void cancelReturnRequest_NotInPendingState_ThrowsIllegalArgumentException() {
        pendingReturnRequest.setStatus(ReturnRequestStatus.COMPLETED);
        when(userRepository.findByEmail("student@college.test")).thenReturn(Optional.of(member));
        when(returnRequestRepository.findByIdForUpdate(200L)).thenReturn(Optional.of(pendingReturnRequest));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                returnRequestService.cancelReturnRequest(200L, "student@college.test")
        );

        assertEquals("Return request is not pending", ex.getMessage());
        verify(returnRequestRepository, never()).save(any());
    }

    @Test
    void cancelReturnRequest_NotFound_ThrowsResourceNotFoundException() {
        when(userRepository.findByEmail("student@college.test")).thenReturn(Optional.of(member));
        when(returnRequestRepository.findByIdForUpdate(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                returnRequestService.cancelReturnRequest(999L, "student@college.test")
        );
    }

    @Test
    void rejectReturn_Success() {
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(returnRequestRepository.findByIdForUpdate(200L)).thenReturn(Optional.of(pendingReturnRequest));
        when(returnRequestRepository.save(any(ReturnRequestRecord.class))).thenAnswer(i -> i.getArgument(0));

        ReturnRequestResponse response = returnRequestService.rejectReturn(200L, "librarian@college.test");

        assertNotNull(response);
        assertEquals(ReturnRequestStatus.REJECTED, response.getStatus());
        assertNotNull(response.getProcessedAt());
        verify(returnRequestRepository).save(pendingReturnRequest);
        // Critical requirement: Loan must remain unreturned and stock unchanged
        assertEquals(BorrowStatus.BORROWED, borrowRecord.getStatus());
        assertNull(borrowRecord.getReturnDate());
        assertEquals(9, book.getAvailableQuantity());
        verify(borrowRecordRepository, never()).save(any());
        verify(bookRepository, never()).save(any());
    }

    @Test
    void rejectReturn_NotStaff_ThrowsIllegalArgumentException() {
        when(userRepository.findByEmail("student@college.test")).thenReturn(Optional.of(member));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                returnRequestService.rejectReturn(200L, "student@college.test")
        );

        assertEquals("Only admin or librarian can reject return requests", ex.getMessage());
        verify(returnRequestRepository, never()).save(any());
    }

    @Test
    void rejectReturn_NotInPendingState_ThrowsIllegalArgumentException() {
        pendingReturnRequest.setStatus(ReturnRequestStatus.REJECTED);
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(returnRequestRepository.findByIdForUpdate(200L)).thenReturn(Optional.of(pendingReturnRequest));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                returnRequestService.rejectReturn(200L, "librarian@college.test")
        );

        assertEquals("Return request is not pending", ex.getMessage());
        verify(returnRequestRepository, never()).save(any());
    }

    @Test
    void rejectReturn_NotFound_ThrowsResourceNotFoundException() {
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(returnRequestRepository.findByIdForUpdate(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                returnRequestService.rejectReturn(999L, "librarian@college.test")
        );
    }

    @Test
    void confirmReturn_OnDueDate_NoFine() {
        borrowRecord.setDueDate(LocalDate.now());
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(returnRequestRepository.findByIdForUpdate(200L)).thenReturn(Optional.of(pendingReturnRequest));
        when(bookRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(book));
        when(returnRequestRepository.save(any(ReturnRequestRecord.class))).thenAnswer(i -> i.getArgument(0));

        ReturnRequestResponse response = returnRequestService.confirmReturn(200L, "librarian@college.test");

        assertNotNull(response);
        assertEquals(ReturnRequestStatus.COMPLETED, response.getStatus());
        assertEquals(BorrowStatus.RETURNED, borrowRecord.getStatus());
        assertEquals(LocalDate.now(), borrowRecord.getReturnDate());
        assertEquals(0.0, borrowRecord.getFine());
        assertEquals(0.0, response.getFine());
        assertEquals(0, response.getDaysOverdue());
        assertEquals(10, book.getAvailableQuantity()); // Restored 9 -> 10
        verify(bookRepository, atLeastOnce()).save(book);
        verify(borrowRecordRepository).save(borrowRecord);
        verify(returnRequestRepository).save(pendingReturnRequest);
    }

    @Test
    void confirmReturn_OneDayOverdue_OneDayFine() {
        borrowRecord.setDueDate(LocalDate.now().minusDays(1));
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(returnRequestRepository.findByIdForUpdate(200L)).thenReturn(Optional.of(pendingReturnRequest));
        when(bookRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(book));
        when(returnRequestRepository.save(any(ReturnRequestRecord.class))).thenAnswer(i -> i.getArgument(0));

        ReturnRequestResponse response = returnRequestService.confirmReturn(200L, "librarian@college.test");

        assertNotNull(response);
        assertEquals(ReturnRequestStatus.COMPLETED, response.getStatus());
        assertEquals(BorrowStatus.RETURNED, borrowRecord.getStatus());
        assertEquals(10.0, borrowRecord.getFine());
        assertEquals(10.0, response.getFine());
        assertEquals(1, response.getDaysOverdue());
        assertEquals(10, book.getAvailableQuantity());
    }

    @Test
    void confirmReturn_MultipleDaysOverdue_CorrectTotalFine() {
        borrowRecord.setDueDate(LocalDate.now().minusDays(5));
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(returnRequestRepository.findByIdForUpdate(200L)).thenReturn(Optional.of(pendingReturnRequest));
        when(bookRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(book));
        when(returnRequestRepository.save(any(ReturnRequestRecord.class))).thenAnswer(i -> i.getArgument(0));

        ReturnRequestResponse response = returnRequestService.confirmReturn(200L, "librarian@college.test");

        assertNotNull(response);
        assertEquals(ReturnRequestStatus.COMPLETED, response.getStatus());
        assertEquals(BorrowStatus.RETURNED, borrowRecord.getStatus());
        assertEquals(50.0, borrowRecord.getFine());
        assertEquals(50.0, response.getFine());
        assertEquals(5, response.getDaysOverdue());
        assertEquals(10, book.getAvailableQuantity());
    }

    @Test
    void confirmReturn_BeforeDueDate_NoFine() {
        borrowRecord.setDueDate(LocalDate.now().plusDays(4));
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(returnRequestRepository.findByIdForUpdate(200L)).thenReturn(Optional.of(pendingReturnRequest));
        when(bookRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(book));
        when(returnRequestRepository.save(any(ReturnRequestRecord.class))).thenAnswer(i -> i.getArgument(0));

        ReturnRequestResponse response = returnRequestService.confirmReturn(200L, "librarian@college.test");

        assertNotNull(response);
        assertEquals(ReturnRequestStatus.COMPLETED, response.getStatus());
        assertEquals(BorrowStatus.RETURNED, borrowRecord.getStatus());
        assertEquals(0.0, borrowRecord.getFine());
        assertEquals(0.0, response.getFine());
        assertEquals(0, response.getDaysOverdue());
    }

    @Test
    void confirmReturn_AlreadyCompleted_ThrowsIllegalArgumentException() {
        pendingReturnRequest.setStatus(ReturnRequestStatus.COMPLETED);
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(returnRequestRepository.findByIdForUpdate(200L)).thenReturn(Optional.of(pendingReturnRequest));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                returnRequestService.confirmReturn(200L, "librarian@college.test")
        );

        assertEquals("Return request is not pending", ex.getMessage());
        verify(borrowRecordRepository, never()).save(any());
        verify(bookRepository, never()).save(any());
    }
}

