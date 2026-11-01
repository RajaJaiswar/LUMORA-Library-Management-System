package com.library.librarymanagementsystem.service.Impl;

import com.library.librarymanagementsystem.dto.response.DashboardResponse;
import com.library.librarymanagementsystem.entity.*;
import com.library.librarymanagementsystem.repository.*;
import com.library.librarymanagementsystem.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final Double FINE_PER_DAY = 10.0;

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final ReturnRequestRepository returnRequestRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {

        List<User> users = userRepository.findAll();

        List<Book> books = bookRepository.findAll();

        List<BorrowRecord> borrowRecords =
                borrowRecordRepository.findAll();

        // ==================== USERS ====================

        long totalUsers = users.size();

        long activeUsers = users.stream()
                .filter(user ->
                        user.getStatus() == UserStatus.ACTIVE)
                .count();

        long inactiveUsers = users.stream()
                .filter(user ->
                        user.getStatus() == UserStatus.INACTIVE)
                .count();

        long totalAdmins = users.stream()
                .filter(user ->
                        user.getRole() == Role.ADMIN)
                .count();

        long totalLibrarians = users.stream()
                .filter(user ->
                        user.getRole() == Role.LIBRARIAN)
                .count();

        long totalMembers = users.stream()
                .filter(user ->
                        user.getRole() == Role.MEMBER)
                .count();


        // ==================== BOOKS ====================

        long totalBooks = books.size();

        long totalBookCopies = books.stream()
                .mapToLong(Book::getQuantity)
                .sum();

        long availableBookCopies = books.stream()
                .mapToLong(Book::getAvailableQuantity)
                .sum();

        long borrowedBookCopies =
                totalBookCopies - availableBookCopies;


        // ==================== BORROWING ====================

        long activeBorrowRecords = borrowRecords.stream()
                .filter(record ->
                        getCurrentStatus(record)
                                != BorrowStatus.RETURNED)
                .count();

        long overdueBorrowRecords = borrowRecords.stream()
                .filter(record ->
                        getCurrentStatus(record)
                                == BorrowStatus.OVERDUE)
                .count();

        long returnedBorrowRecords = borrowRecords.stream()
                .filter(record ->
                        getCurrentStatus(record)
                                == BorrowStatus.RETURNED)
                .count();


        // ==================== FINES ====================

        double totalOutstandingFine = borrowRecords.stream()
                .filter(record ->
                        getCurrentStatus(record)
                                == BorrowStatus.OVERDUE)
                .mapToDouble(this::calculateFine)
                .sum();


        // ==================== REQUESTS ====================

        long pendingBorrowRequests =
                borrowRequestRepository.countByStatus(
                        BorrowRequestStatus.PENDING
                );

        long pendingReturnRequests =
                returnRequestRepository.countByStatus(
                        ReturnRequestStatus.PENDING
                );


        // ==================== RESPONSE ====================

        return DashboardResponse.builder()

                // Users
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .totalAdmins(totalAdmins)
                .totalLibrarians(totalLibrarians)
                .totalMembers(totalMembers)

                // Books
                .totalBooks(totalBooks)
                .totalBookCopies(totalBookCopies)
                .availableBookCopies(availableBookCopies)
                .borrowedBookCopies(borrowedBookCopies)

                // Borrowing
                .activeBorrowRecords(activeBorrowRecords)
                .overdueBorrowRecords(overdueBorrowRecords)
                .returnedBorrowRecords(returnedBorrowRecords)

                // Requests
                .pendingBorrowRequests(pendingBorrowRequests)
                .pendingReturnRequests(pendingReturnRequests)

                // Fines
                .totalOutstandingFine(totalOutstandingFine)

                .build();
    }


    private BorrowStatus getCurrentStatus(BorrowRecord record) {

        if (record.getStatus() == BorrowStatus.BORROWED
                && LocalDate.now().isAfter(record.getDueDate())) {

            return BorrowStatus.OVERDUE;
        }

        return record.getStatus();
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