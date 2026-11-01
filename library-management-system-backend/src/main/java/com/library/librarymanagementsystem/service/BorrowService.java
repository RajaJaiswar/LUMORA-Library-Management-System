package com.library.librarymanagementsystem.service;

import com.library.librarymanagementsystem.dto.request.BorrowExtensionRequest;
import com.library.librarymanagementsystem.dto.response.BorrowExtensionResponse;
import com.library.librarymanagementsystem.dto.response.BorrowResponse;
import com.library.librarymanagementsystem.entity.BorrowStatus;

import java.util.List;

public interface BorrowService {



    List<BorrowResponse> getMyBorrowRecords(
            String userEmail
    );

    List<BorrowResponse> getAllBorrowRecords();

    List<BorrowResponse> getBorrowRecordsByStatus(
            BorrowStatus status
    );

    BorrowResponse getBorrowRecordById(Long borrowId);

    BorrowResponse extendBorrow(
            Long borrowId,
            BorrowExtensionRequest request,
            String userEmail
    );

    List<BorrowExtensionResponse> getExtensionHistory(
            Long borrowId
    );

    List<BorrowExtensionResponse> getAllExtensionHistory();

    List<BorrowResponse> getMyActiveBorrowRecords(String userEmail);

    List<BorrowResponse> getMyOverdueBorrowRecords(String userEmail);
}
