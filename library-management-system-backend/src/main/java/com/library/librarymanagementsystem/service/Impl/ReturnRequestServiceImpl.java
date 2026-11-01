package com.library.librarymanagementsystem.service.Impl;

import com.library.librarymanagementsystem.dto.response.ReturnRequestResponse;
import com.library.librarymanagementsystem.entity.*;
import com.library.librarymanagementsystem.exception.ResourceNotFoundException;
import com.library.librarymanagementsystem.repository.BookRepository;
import com.library.librarymanagementsystem.repository.BorrowRecordRepository;
import com.library.librarymanagementsystem.repository.ReturnRequestRepository;
import com.library.librarymanagementsystem.repository.UserRepository;
import com.library.librarymanagementsystem.service.ReturnRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReturnRequestServiceImpl
        implements ReturnRequestService {

    private static final double FINE_PER_DAY = 10.0;

    private final ReturnRequestRepository returnRequestRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    private double calculateFine(
            BorrowRecord borrowRecord,
            LocalDate returnDate) {

        if (!returnDate.isAfter(borrowRecord.getDueDate())) {
            return 0.0;
        }

        long overdueDays =
                ChronoUnit.DAYS.between(
                        borrowRecord.getDueDate(),
                        returnDate
                );

        return overdueDays * FINE_PER_DAY;
    }

    @Override
    @Transactional
    public ReturnRequestResponse createReturnRequest(
            Long borrowId,
            String userEmail) {

        User user = getUserByEmail(userEmail);

        BorrowRecord borrowRecord =
                borrowRecordRepository.findById(borrowId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrow record not found with id: "
                                                + borrowId
                                )
                        );

        // Make sure this loan belongs to the logged-in member
        if (!borrowRecord.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "You cannot return another user's borrow record"
            );
        }

        // The book must still be physically borrowed
        if (borrowRecord.getStatus() == BorrowStatus.RETURNED) {
            throw new IllegalArgumentException(
                    "Book has already been returned"
            );
        }

        // Prevent duplicate pending return requests
        boolean alreadyRequested =
                returnRequestRepository
                        .existsByBorrowRecordAndStatus(
                                borrowRecord,
                                ReturnRequestStatus.PENDING
                        );

        if (alreadyRequested) {
            throw new IllegalArgumentException(
                    "You already have a pending return request for this book"
            );
        }

        ReturnRequestRecord returnRequest =
                ReturnRequestRecord.builder()
                        .borrowRecord(borrowRecord)
                        .status(ReturnRequestStatus.PENDING)
                        .build();

        ReturnRequestRecord savedRequest =
                returnRequestRepository.save(returnRequest);

        return mapToResponse(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReturnRequestResponse> getMyReturnRequests(
            String userEmail) {

        User user = getUserByEmail(userEmail);

        return returnRequestRepository
                .findByBorrowRecord_UserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReturnRequestResponse> getPendingReturnRequests() {

        return returnRequestRepository
                .findByStatus(ReturnRequestStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReturnRequestResponse getReturnRequestById(
            Long requestId) {

        ReturnRequestRecord returnRequest =
                returnRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Return request not found with id: "
                                                + requestId
                                )
                        );

        return mapToResponse(returnRequest);
    }

    @Override
    @Transactional
    public ReturnRequestResponse confirmReturn(
            Long requestId,
            String staffEmail) {

        // 1. Verify staff member
        User staff = getUserByEmail(staffEmail);

        if (staff.getRole() != Role.ADMIN
                && staff.getRole() != Role.LIBRARIAN) {

            throw new IllegalArgumentException(
                    "Only admin or librarian can confirm returns"
            );
        }

        // 2. Find return request with a pessimistic write lock
        ReturnRequestRecord returnRequest =
                returnRequestRepository.findByIdForUpdate(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Return request not found with id: "
                                                + requestId
                                )
                        );

        // 3. Request must still be pending
        if (returnRequest.getStatus()
                != ReturnRequestStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Return request is not pending"
            );
        }

        // 4. Get the actual borrow record
        BorrowRecord borrowRecord =
                returnRequest.getBorrowRecord();

        // 5. Make sure the book hasn't already been returned
        if (borrowRecord.getStatus()
                == BorrowStatus.RETURNED) {

            throw new IllegalArgumentException(
                    "Book has already been returned"
            );
        }

        // 6. Physical return date
        LocalDate returnDate = LocalDate.now();

        // 7. Calculate final fine
        double fine = calculateFine(
                borrowRecord,
                returnDate
        );

        // 8. Update actual borrow record
        borrowRecord.setReturnDate(returnDate);
        borrowRecord.setFine(fine);
        borrowRecord.setStatus(BorrowStatus.RETURNED);

        // 9. Get the book with a pessimistic write lock
        Book book = bookRepository.findByIdForUpdate(
                borrowRecord.getBook().getId()
        ).orElseThrow(() ->
                new ResourceNotFoundException(
                        "Book not found with id: "
                                + borrowRecord.getBook().getId()
                )
        );

        // Increase available inventory
        book.setAvailableQuantity(
                book.getAvailableQuantity() + 1
        );

        bookRepository.save(book);
        borrowRecordRepository.save(borrowRecord);

        // 10. Save book
        // 11. Save borrow record
        // 12. Mark request completed

        returnRequest.setStatus(
                ReturnRequestStatus.COMPLETED
        );

        returnRequest.setProcessedAt(
                LocalDateTime.now()
        );

        // Save all changes
        // Transaction guarantees they succeed/fail together.

        returnRequestRepository.save(returnRequest);

        return mapToResponse(returnRequest);
    }

    @Override
    @Transactional
    public ReturnRequestResponse rejectReturn(
            Long requestId,
            String staffEmail) {

        User staff = getUserByEmail(staffEmail);

        if (staff.getRole() != Role.ADMIN
                && staff.getRole() != Role.LIBRARIAN) {

            throw new IllegalArgumentException(
                    "Only admin or librarian can reject return requests"
            );
        }

        ReturnRequestRecord returnRequest =
                returnRequestRepository.findByIdForUpdate(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Return request not found with id: "
                                                + requestId
                                )
                        );

        if (returnRequest.getStatus() != ReturnRequestStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Return request is not pending"
            );
        }

        returnRequest.setStatus(ReturnRequestStatus.REJECTED);
        returnRequest.setProcessedAt(LocalDateTime.now());

        ReturnRequestRecord updatedRequest =
                returnRequestRepository.save(returnRequest);

        return mapToResponse(updatedRequest);
    }

    @Override
    @Transactional
    public ReturnRequestResponse cancelReturnRequest(
            Long requestId,
            String userEmail) {

        User user = getUserByEmail(userEmail);

        ReturnRequestRecord returnRequest =
                returnRequestRepository.findByIdForUpdate(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Return request not found with id: "
                                                + requestId
                                )
                        );

        if (!returnRequest.getBorrowRecord().getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "You cannot cancel another user's return request"
            );
        }

        if (returnRequest.getStatus() != ReturnRequestStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Return request is not pending"
            );
        }

        returnRequest.setStatus(ReturnRequestStatus.CANCELLED);
        returnRequest.setProcessedAt(LocalDateTime.now());

        ReturnRequestRecord updatedRequest =
                returnRequestRepository.save(returnRequest);

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

    private ReturnRequestResponse mapToResponse(
            ReturnRequestRecord returnRequest) {

        BorrowRecord borrowRecord =
                returnRequest.getBorrowRecord();

        LocalDate today = LocalDate.now();

        long daysOverdue = 0;

        if (today.isAfter(borrowRecord.getDueDate())) {
            daysOverdue =
                    ChronoUnit.DAYS.between(
                            borrowRecord.getDueDate(),
                            today
                    );
        }

        double fine = daysOverdue * FINE_PER_DAY;

        BorrowStatus currentBorrowStatus =
                borrowRecord.getStatus();

        if (currentBorrowStatus == BorrowStatus.BORROWED
                && today.isAfter(borrowRecord.getDueDate())) {

            currentBorrowStatus = BorrowStatus.OVERDUE;
        }

        return ReturnRequestResponse.builder()

                .id(returnRequest.getId())

                .borrowId(borrowRecord.getId())

                .userId(
                        borrowRecord.getUser().getId()
                )

                .libraryMemberId(
                        borrowRecord.getUser().getLibraryMemberId()
                )

                .userName(
                        borrowRecord.getUser().getName()
                )

                .bookId(
                        borrowRecord.getBook().getId()
                )

                .bookTitle(
                        borrowRecord.getBook().getTitle()
                )

                .isbn(
                        borrowRecord.getBook().getIsbn()
                )

                .issueDate(
                        borrowRecord.getIssueDate()
                )

                .dueDate(
                        borrowRecord.getDueDate()
                )

                .returnRequestedDate(
                        returnRequest.getRequestedAt().toLocalDate()
                )

                .daysOverdue(daysOverdue)

                .fine(fine)

                .borrowStatus(
                        currentBorrowStatus.name()
                )

                .status(
                        returnRequest.getStatus()
                )

                .requestedAt(
                        returnRequest.getRequestedAt()
                )

                .processedAt(
                        returnRequest.getProcessedAt()
                )

                .build();
    }


}