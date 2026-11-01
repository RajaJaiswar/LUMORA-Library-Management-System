package com.library.librarymanagementsystem.dto.response;

import com.library.librarymanagementsystem.entity.ReturnRequestStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequestResponse {

    private Long id;

    private Long borrowId;

    private Long userId;
    private String libraryMemberId;
    private String userName;

    private Long bookId;
    private String bookTitle;
    private String isbn;

    private LocalDate issueDate;
    private LocalDate dueDate;

    private LocalDate returnRequestedDate;

    private long daysOverdue;

    private Double fine;

    private String borrowStatus;
    private ReturnRequestStatus status;

    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
}