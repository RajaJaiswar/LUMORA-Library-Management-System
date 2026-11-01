package com.library.librarymanagementsystem.dto.response;


import com.library.librarymanagementsystem.entity.BorrowStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowResponse {

    private Long id;

    private Long userId;
    private String userName;

    private Long bookId;
    private String bookTitle;

    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;

    private BorrowStatus status;

    private Double fine;
}
