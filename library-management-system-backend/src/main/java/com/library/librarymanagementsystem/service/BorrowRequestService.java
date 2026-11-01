package com.library.librarymanagementsystem.service;

import com.library.librarymanagementsystem.dto.request.BorrowRequest;
import com.library.librarymanagementsystem.dto.response.BorrowRequestResponse;

import java.util.List;

public interface BorrowRequestService {

    BorrowRequestResponse createBorrowRequest(
            BorrowRequest request,
            String userEmail
    );

    List<BorrowRequestResponse> getMyBorrowRequests(
            String userEmail
    );

    List<BorrowRequestResponse> getPendingBorrowRequests();

    BorrowRequestResponse getBorrowRequestById(
            Long requestId
    );

    BorrowRequestResponse issueBook(
            Long requestId,
            String staffEmail
    );

    BorrowRequestResponse rejectBorrowRequest(
            Long requestId,
            String staffEmail
    );

    BorrowRequestResponse cancelBorrowRequest(
            Long requestId,
            String userEmail
    );
}