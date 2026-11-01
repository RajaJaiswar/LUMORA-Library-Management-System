package com.library.librarymanagementsystem.service.Impl;

import com.library.librarymanagementsystem.dto.request.BorrowExtensionRequest;
import com.library.librarymanagementsystem.dto.response.BorrowExtensionResponse;
import com.library.librarymanagementsystem.dto.response.BorrowResponse;
import com.library.librarymanagementsystem.entity.*;
import com.library.librarymanagementsystem.exception.ResourceNotFoundException;
import com.library.librarymanagementsystem.repository.BookRepository;
import com.library.librarymanagementsystem.repository.BorrowExtensionRepository;
import com.library.librarymanagementsystem.repository.BorrowRecordRepository;
import com.library.librarymanagementsystem.repository.UserRepository;
import com.library.librarymanagementsystem.service.BorrowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BorrowServiceImpl implements BorrowService {

    private static final double FINE_PER_DAY = 10.0;
    private static final int MAX_EXTENSION_DAYS = 7;
    private static final int MAX_EXTENSIONS = 2;

    private final BorrowRecordRepository borrowRecordRepository;
    private final UserRepository userRepository;
    private final BorrowExtensionRepository borrowExtensionRepository;


    @Override
    @Transactional(readOnly = true)
    public List<BorrowResponse> getMyBorrowRecords(
            String userEmail) {

        User user = getUserByEmail(userEmail);

        return borrowRecordRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );
    }

    private BorrowResponse mapToResponse(
            BorrowRecord record) {

        return BorrowResponse.builder()
                .id(record.getId())
                .userId(record.getUser().getId())
                .userName(record.getUser().getName())
                .bookId(record.getBook().getId())
                .bookTitle(record.getBook().getTitle())
                .issueDate(record.getIssueDate())
                .dueDate(record.getDueDate())
                .returnDate(record.getReturnDate())
                .status(getCurrentStatus(record))
                .fine(calculateFine(record))
                .build();
    }

    private BorrowStatus getCurrentStatus(BorrowRecord record) {

        if (record.getStatus() == BorrowStatus.BORROWED
                && LocalDate.now().isAfter(record.getDueDate())) {

            return BorrowStatus.OVERDUE;
        }

        return record.getStatus();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BorrowResponse> getAllBorrowRecords() {

        return borrowRecordRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BorrowResponse> getBorrowRecordsByStatus(
            BorrowStatus status) {

        return borrowRecordRepository.findAll()
                .stream()
                .filter(record ->
                        getCurrentStatus(record) == status
                )
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BorrowResponse getBorrowRecordById(
            Long borrowId) {

        BorrowRecord record =
                borrowRecordRepository.findById(borrowId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrow record not found with id: "
                                                + borrowId
                                )
                        );

        return mapToResponse(record);
    }

    @Override
    @Transactional
    public BorrowResponse extendBorrow(
            Long borrowId,
            BorrowExtensionRequest request,
            String userEmail) {

        User user = getUserByEmail(userEmail);

        BorrowRecord record =
                borrowRecordRepository.findById(borrowId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrow record not found with id: "
                                                + borrowId
                                )
                        );

        boolean isAdminOrLibrarian =
                user.getRole() == Role.ADMIN
                        || user.getRole() == Role.LIBRARIAN;

        if (!isAdminOrLibrarian
                && !record.getUser().getId().equals(user.getId())) {

            throw new IllegalArgumentException(
                    "You cannot extend another user's borrow record"
            );
        }

        if (record.getStatus() == BorrowStatus.RETURNED) {
            throw new IllegalArgumentException(
                    "Cannot extend a returned borrow record"
            );
        }

        if (LocalDate.now().isAfter(record.getDueDate())) {
            throw new IllegalArgumentException(
                    "Cannot extend an overdue borrow record"
            );
        }

        if (record.getExtensionCount() >= MAX_EXTENSIONS) {
            throw new IllegalArgumentException(
                    "Maximum extension limit reached"
            );
        }

        long extensionDays =
                java.time.temporal.ChronoUnit.DAYS.between(
                        record.getDueDate(),
                        request.getNewDueDate()
                );

        if (extensionDays <= 0) {
            throw new IllegalArgumentException(
                    "New due date must be after current due date"
            );
        }

        if (extensionDays > MAX_EXTENSION_DAYS) {
            throw new IllegalArgumentException(
                    "Maximum extension is 7 days"
            );
        }

        BorrowExtension extension =
                BorrowExtension.builder()
                        .borrowRecord(record)
                        .extendedBy(user)
                        .oldDueDate(record.getDueDate())
                        .newDueDate(request.getNewDueDate())
                        .reason(request.getReason())
                        .build();

        borrowExtensionRepository.save(extension);

        record.setDueDate(request.getNewDueDate());
        record.setExtensionCount(
                record.getExtensionCount() + 1
        );

        BorrowRecord updatedRecord =
                borrowRecordRepository.save(record);

        return mapToResponse(updatedRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BorrowExtensionResponse> getExtensionHistory(
            Long borrowId) {

        borrowRecordRepository.findById(borrowId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Borrow record not found with id: "
                                        + borrowId
                        )
                );

        return borrowExtensionRepository
                .findByBorrowRecordId(borrowId)
                .stream()
                .map(this::mapExtensionToResponse)
                .collect(Collectors.toList());
    }

    private BorrowExtensionResponse mapExtensionToResponse(
            BorrowExtension extension) {

        BorrowRecord borrowRecord =
                extension.getBorrowRecord();

        return BorrowExtensionResponse.builder()
                .id(extension.getId())
                .borrowId(borrowRecord.getId())

                .userId(
                        borrowRecord.getUser().getId()
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

                .oldDueDate(
                        extension.getOldDueDate()
                )
                .newDueDate(
                        extension.getNewDueDate()
                )

                .reason(
                        extension.getReason()
                )

                .extendedByUserId(
                        extension.getExtendedBy().getId()
                )
                .extendedByUserName(
                        extension.getExtendedBy().getName()
                )

                .createdAt(
                        extension.getCreatedAt()
                )
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BorrowExtensionResponse> getAllExtensionHistory() {

        return borrowExtensionRepository.findAll()
                .stream()
                .map(this::mapExtensionToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BorrowResponse> getMyActiveBorrowRecords(String userEmail) {

        User user = getUserByEmail(userEmail);

        return borrowRecordRepository.findByUser(user)
                .stream()
                .filter(record -> getCurrentStatus(record) != BorrowStatus.RETURNED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BorrowResponse> getMyOverdueBorrowRecords(String userEmail) {

        User user = getUserByEmail(userEmail);

        return borrowRecordRepository.findByUser(user)
                .stream()
                .filter(record ->
                        getCurrentStatus(record) == BorrowStatus.OVERDUE)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Double calculateFine(BorrowRecord record) {

        LocalDate endDate;

        if (record.getReturnDate() != null) {
            endDate = record.getReturnDate();
        } else {
            endDate = LocalDate.now();
        }

        if (!endDate.isAfter(record.getDueDate())) {
            return 0.0;
        }

        long overdueDays = ChronoUnit.DAYS.between(
                record.getDueDate(),
                endDate
        );

        return overdueDays * FINE_PER_DAY;
    }
}
