package com.library.librarymanagementsystem.service;

import com.library.librarymanagementsystem.dto.response.ReturnRequestResponse;

import java.util.List;

public interface ReturnRequestService {

    ReturnRequestResponse createReturnRequest(
            Long borrowId,
            String userEmail
    );

    List<ReturnRequestResponse> getMyReturnRequests(
            String userEmail
    );

    List<ReturnRequestResponse> getPendingReturnRequests();

    ReturnRequestResponse getReturnRequestById(
            Long requestId
    );

    ReturnRequestResponse confirmReturn(
            Long requestId,
            String staffEmail
    );

    ReturnRequestResponse rejectReturn(
            Long requestId,
            String staffEmail
    );

    ReturnRequestResponse cancelReturnRequest(
            Long requestId,
            String userEmail
    );
}