package com.library.librarymanagementsystem.service;

import com.library.librarymanagementsystem.dto.response.BorrowRequestResponse;
import com.library.librarymanagementsystem.entity.*;
import com.library.librarymanagementsystem.exception.ResourceNotFoundException;
import com.library.librarymanagementsystem.repository.BookRepository;
import com.library.librarymanagementsystem.repository.BorrowRecordRepository;
import com.library.librarymanagementsystem.repository.BorrowRequestRepository;
import com.library.librarymanagementsystem.repository.UserRepository;
import com.library.librarymanagementsystem.service.Impl.BorrowRequestServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BorrowRequestServiceTest {

    @Mock
    private BorrowRequestRepository borrowRequestRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BorrowRecordRepository borrowRecordRepository;

    @InjectMocks
    private BorrowRequestServiceImpl borrowRequestService;

    private User member;
    private User anotherMember;
    private User librarian;
    private Book book;
    private BorrowRequestRecord pendingRequest;

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
                .title("Clean Architecture")
                .isbn("978-0134494166")
                .quantity(5)
                .availableQuantity(5)
                .build();

        pendingRequest = BorrowRequestRecord.builder()
                .id(100L)
                .user(member)
                .book(book)
                .status(BorrowRequestStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void cancelBorrowRequest_Success() {
        when(userRepository.findByEmail("student@college.test")).thenReturn(Optional.of(member));
        when(borrowRequestRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(pendingRequest));
        when(borrowRequestRepository.save(any(BorrowRequestRecord.class))).thenAnswer(i -> i.getArgument(0));

        BorrowRequestResponse response = borrowRequestService.cancelBorrowRequest(100L, "student@college.test");

        assertNotNull(response);
        assertEquals(BorrowRequestStatus.CANCELLED, response.getStatus());
        assertNotNull(response.getProcessedAt());
        verify(borrowRequestRepository).save(pendingRequest);
    }

    @Test
    void cancelBorrowRequest_AnotherUser_ThrowsIllegalArgumentException() {
        when(userRepository.findByEmail("other@college.test")).thenReturn(Optional.of(anotherMember));
        when(borrowRequestRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(pendingRequest));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                borrowRequestService.cancelBorrowRequest(100L, "other@college.test")
        );

        assertEquals("You cannot cancel another user's borrow request", ex.getMessage());
        verify(borrowRequestRepository, never()).save(any());
    }

    @Test
    void cancelBorrowRequest_NotInPendingState_ThrowsIllegalArgumentException() {
        pendingRequest.setStatus(BorrowRequestStatus.ISSUED);
        when(userRepository.findByEmail("student@college.test")).thenReturn(Optional.of(member));
        when(borrowRequestRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(pendingRequest));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                borrowRequestService.cancelBorrowRequest(100L, "student@college.test")
        );

        assertEquals("Borrow request is not pending", ex.getMessage());
        verify(borrowRequestRepository, never()).save(any());
    }

    @Test
    void cancelBorrowRequest_NotFound_ThrowsResourceNotFoundException() {
        when(userRepository.findByEmail("student@college.test")).thenReturn(Optional.of(member));
        when(borrowRequestRepository.findByIdForUpdate(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                borrowRequestService.cancelBorrowRequest(999L, "student@college.test")
        );
    }

    @Test
    void rejectBorrowRequest_Success() {
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(borrowRequestRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(pendingRequest));
        when(borrowRequestRepository.save(any(BorrowRequestRecord.class))).thenAnswer(i -> i.getArgument(0));

        BorrowRequestResponse response = borrowRequestService.rejectBorrowRequest(100L, "librarian@college.test");

        assertNotNull(response);
        assertEquals(BorrowRequestStatus.REJECTED, response.getStatus());
        assertNotNull(response.getProcessedAt());
        verify(borrowRequestRepository).save(pendingRequest);
    }

    @Test
    void rejectBorrowRequest_NotStaff_ThrowsIllegalArgumentException() {
        when(userRepository.findByEmail("student@college.test")).thenReturn(Optional.of(member));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                borrowRequestService.rejectBorrowRequest(100L, "student@college.test")
        );

        assertEquals("Only admin or librarian can reject borrow requests", ex.getMessage());
        verify(borrowRequestRepository, never()).save(any());
    }

    @Test
    void rejectBorrowRequest_NotInPendingState_ThrowsIllegalArgumentException() {
        pendingRequest.setStatus(BorrowRequestStatus.CANCELLED);
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(borrowRequestRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(pendingRequest));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                borrowRequestService.rejectBorrowRequest(100L, "librarian@college.test")
        );

        assertEquals("Borrow request is not pending", ex.getMessage());
        verify(borrowRequestRepository, never()).save(any());
    }

    @Test
    void rejectBorrowRequest_NotFound_ThrowsResourceNotFoundException() {
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(borrowRequestRepository.findByIdForUpdate(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                borrowRequestService.rejectBorrowRequest(999L, "librarian@college.test")
        );
    }

    @Test
    void issueBook_Success() {
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(borrowRequestRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(pendingRequest));
        when(bookRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(book));
        when(bookRepository.save(any(Book.class))).thenAnswer(i -> i.getArgument(0));
        when(borrowRecordRepository.save(any(BorrowRecord.class))).thenAnswer(i -> i.getArgument(0));
        when(borrowRequestRepository.save(any(BorrowRequestRecord.class))).thenAnswer(i -> i.getArgument(0));

        BorrowRequestResponse response = borrowRequestService.issueBook(100L, "librarian@college.test");

        assertNotNull(response);
        assertEquals(BorrowRequestStatus.ISSUED, response.getStatus());
        assertEquals(4, book.getAvailableQuantity());
        verify(bookRepository).findByIdForUpdate(10L);
        verify(bookRepository).save(book);
        verify(borrowRecordRepository).save(any(BorrowRecord.class));
        verify(borrowRequestRepository).save(pendingRequest);
    }

    @Test
    void issueBook_NotPending_ThrowsIllegalArgumentException() {
        pendingRequest.setStatus(BorrowRequestStatus.ISSUED);
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(borrowRequestRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(pendingRequest));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                borrowRequestService.issueBook(100L, "librarian@college.test")
        );

        assertEquals("Borrow request is not pending", ex.getMessage());
        verify(bookRepository, never()).findByIdForUpdate(any());
        verify(borrowRecordRepository, never()).save(any());
    }

    @Test
    void issueBook_ZeroAvailableQuantity_ThrowsIllegalArgumentException() {
        book.setAvailableQuantity(0);
        when(userRepository.findByEmail("librarian@college.test")).thenReturn(Optional.of(librarian));
        when(borrowRequestRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(pendingRequest));
        when(bookRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(book));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                borrowRequestService.issueBook(100L, "librarian@college.test")
        );

        assertEquals("Book is no longer available", ex.getMessage());
        verify(borrowRecordRepository, never()).save(any());
    }
}
