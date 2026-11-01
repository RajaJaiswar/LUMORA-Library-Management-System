package com.library.librarymanagementsystem.dto.response;

import com.library.librarymanagementsystem.entity.BorrowRequestStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowRequestResponse {

    private Long id;

    private Long userId;
    private String libraryMemberId;
    private String userName;

    private Long bookId;
    private String bookTitle;
    private String isbn;

    private BorrowRequestStatus status;

    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
}