package com.library.librarymanagementsystem.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowExtensionResponse {

    private Long id;

    private Long borrowId;

    private Long userId;
    private String userName;

    private Long bookId;
    private String bookTitle;

    private LocalDate oldDueDate;
    private LocalDate newDueDate;

    private String reason;

    private Long extendedByUserId;
    private String extendedByUserName;

    private LocalDateTime createdAt;
}