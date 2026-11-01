package com.library.librarymanagementsystem.service.Impl;

import com.library.librarymanagementsystem.dto.request.BorrowRequest;
import com.library.librarymanagementsystem.dto.response.BorrowRequestResponse;
import com.library.librarymanagementsystem.entity.*;
import com.library.librarymanagementsystem.exception.ResourceNotFoundException;
import com.library.librarymanagementsystem.repository.BookRepository;
import com.library.librarymanagementsystem.repository.BorrowRecordRepository;
import com.library.librarymanagementsystem.repository.BorrowRequestRepository;
import com.library.librarymanagementsystem.repository.UserRepository;
import com.library.librarymanagementsystem.service.BorrowRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BorrowRequestServiceImpl
        implements BorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    @Override
    @Transactional
    public BorrowRequestResponse createBorrowRequest(
            BorrowRequest request,
            String userEmail) {

        User user = getUserByEmail(userEmail);

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Book not found with id: "
                                        + request.getBookId()
                        )
                );

        boolean alreadyBorrowed =
                borrowRecordRepository
                        .existsByUserAndBookAndStatusIn(
                                user,
                                book,
                                List.of(
                                        BorrowStatus.BORROWED,
                                        BorrowStatus.OVERDUE
                                )
                        );

        if (alreadyBorrowed) {
            throw new IllegalArgumentException(
                    "You already have this book"
            );
        }

        boolean alreadyRequested =
                borrowRequestRepository
                        .existsByUserAndBookAndStatus(
                                user,
                                book,
                                BorrowRequestStatus.PENDING
                        );

        if (alreadyRequested) {
            throw new IllegalArgumentException(
                    "You already have a pending request for this book"
            );
        }

        if (book.getAvailableQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "Book is currently not available"
            );
        }

        BorrowRequestRecord borrowRequest =
                BorrowRequestRecord.builder()
                        .user(user)
                        .book(book)
                        .status(BorrowRequestStatus.PENDING)
                        .build();

        BorrowRequestRecord savedRequest =
                borrowRequestRepository.save(borrowRequest);

        return mapToResponse(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BorrowRequestResponse> getMyBorrowRequests(
            String userEmail) {

        User user = getUserByEmail(userEmail);

        return borrowRequestRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BorrowRequestResponse> getPendingBorrowRequests() {

        return borrowRequestRepository
                .findByStatus(BorrowRequestStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BorrowRequestResponse getBorrowRequestById(
            Long requestId) {

        BorrowRequestRecord request =
                borrowRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrow request not found with id: "
                                                + requestId
                                )
                        );

        return mapToResponse(request);
    }

    @Override
    @Transactional
    public BorrowRequestResponse issueBook(
            Long requestId,
            String staffEmail) {

        // 1. Verify the staff member
        User staff = getUserByEmail(staffEmail);

        if (staff.getRole() != Role.ADMIN
                && staff.getRole() != Role.LIBRARIAN) {

            throw new IllegalArgumentException(
                    "Only admin or librarian can issue books"
            );
        }

        // 2. Find the borrow request with a pessimistic write lock
        BorrowRequestRecord borrowRequest =
                borrowRequestRepository.findByIdForUpdate(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrow request not found with id: "
                                                + requestId
                                )
                        );

        // 3. Request must still be pending
        if (borrowRequest.getStatus()
                != BorrowRequestStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Borrow request is not pending"
            );
        }

        // 4. Get the book with a pessimistic write lock
        Book book = bookRepository.findByIdForUpdate(borrowRequest.getBook().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Book not found with id: "
                                        + borrowRequest.getBook().getId()
                        )
                );

        // 5. Check availability again while holding the lock
        if (book.getAvailableQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "Book is no longer available"
            );
        }

        // 6. Create the actual borrow record
        BorrowRecord borrowRecord =
                BorrowRecord.builder()
                        .user(borrowRequest.getUser())
                        .book(book)
                        .issueDate(java.time.LocalDate.now())
                        .dueDate(
                                java.time.LocalDate.now().plusDays(14)
                        )
                        .status(BorrowStatus.BORROWED)
                        .fine(0.0)
                        .extensionCount(0)
                        .build();

        // 7. Decrease available inventory
        book.setAvailableQuantity(
                book.getAvailableQuantity() - 1
        );

        bookRepository.save(book);

        // 8. Save actual borrow record
        borrowRecordRepository.save(borrowRecord);

        // 9. Mark request as issued
        borrowRequest.setStatus(
                BorrowRequestStatus.ISSUED
        );

        borrowRequest.setProcessedAt(
                java.time.LocalDateTime.now()
        );

        BorrowRequestRecord updatedRequest =
                borrowRequestRepository.save(borrowRequest);

        // 10. Return updated request
        return mapToResponse(updatedRequest);
    }

    @Override
    @Transactional
    public BorrowRequestResponse rejectBorrowRequest(
            Long requestId,
            String staffEmail) {

        User staff = getUserByEmail(staffEmail);

        if (staff.getRole() != Role.ADMIN
                && staff.getRole() != Role.LIBRARIAN) {

            throw new IllegalArgumentException(
                    "Only admin or librarian can reject borrow requests"
            );
        }

        BorrowRequestRecord borrowRequest =
                borrowRequestRepository.findByIdForUpdate(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrow request not found with id: "
                                                + requestId
                                )
                        );

        if (borrowRequest.getStatus() != BorrowRequestStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Borrow request is not pending"
            );
        }

        borrowRequest.setStatus(BorrowRequestStatus.REJECTED);
        borrowRequest.setProcessedAt(java.time.LocalDateTime.now());

        BorrowRequestRecord updatedRequest =
                borrowRequestRepository.save(borrowRequest);

        return mapToResponse(updatedRequest);
    }

    @Override
    @Transactional
    public BorrowRequestResponse cancelBorrowRequest(
            Long requestId,
            String userEmail) {

        User user = getUserByEmail(userEmail);

        BorrowRequestRecord borrowRequest =
                borrowRequestRepository.findByIdForUpdate(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrow request not found with id: "
                                                + requestId
                                )
                        );

        if (!borrowRequest.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "You cannot cancel another user's borrow request"
            );
        }

        if (borrowRequest.getStatus() != BorrowRequestStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Borrow request is not pending"
            );
        }

        borrowRequest.setStatus(BorrowRequestStatus.CANCELLED);
        borrowRequest.setProcessedAt(java.time.LocalDateTime.now());

        BorrowRequestRecord updatedRequest =
                borrowRequestRepository.save(borrowRequest);

        return mapToResponse(updatedRequest);
    }

    private User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );
    }

    private BorrowRequestResponse mapToResponse(
            BorrowRequestRecord request) {

        return BorrowRequestResponse.builder()
                .id(request.getId())

                .userId(request.getUser().getId())
                .libraryMemberId(
                        request.getUser().getLibraryMemberId()
                )
                .userName(
                        request.getUser().getName()
                )

                .bookId(request.getBook().getId())
                .bookTitle(request.getBook().getTitle())
                .isbn(request.getBook().getIsbn())

                .status(request.getStatus())

                .requestedAt(request.getRequestedAt())
                .processedAt(request.getProcessedAt())

                .build();
    }
}