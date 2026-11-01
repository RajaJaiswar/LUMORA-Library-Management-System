package com.library.librarymanagementsystem.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    // Users
    private Long totalUsers;
    private Long activeUsers;
    private Long inactiveUsers;

    private Long totalAdmins;
    private Long totalLibrarians;
    private Long totalMembers;

    // Books
    private Long totalBooks;
    private Long totalBookCopies;
    private Long availableBookCopies;
    private Long borrowedBookCopies;

    // Borrowing
    private Long activeBorrowRecords;
    private Long overdueBorrowRecords;
    private Long returnedBorrowRecords;

    // Requests
    private Long pendingBorrowRequests;
    private Long pendingReturnRequests;

    // Fines
    private Double totalOutstandingFine;
}