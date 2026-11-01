package com.library.librarymanagementsystem.controller;

import com.library.librarymanagementsystem.dto.response.ReturnRequestResponse;
import com.library.librarymanagementsystem.service.ReturnRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/return-requests")
@RequiredArgsConstructor
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;


    // ==================== MEMBER ====================

    @PostMapping("/{borrowId}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ReturnRequestResponse> createReturnRequest(
            @PathVariable Long borrowId,
            Authentication authentication) {

        ReturnRequestResponse response =
                returnRequestService.createReturnRequest(
                        borrowId,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    @GetMapping("/my")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<List<ReturnRequestResponse>>
    getMyReturnRequests(
            Authentication authentication) {

        return ResponseEntity.ok(
                returnRequestService.getMyReturnRequests(
                        authentication.getName()
                )
        );
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ReturnRequestResponse>
    cancelReturnRequest(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                returnRequestService.cancelReturnRequest(
                        id,
                        authentication.getName()
                )
        );
    }


    // ==================== ADMIN / LIBRARIAN ====================

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<ReturnRequestResponse>>
    getPendingReturnRequests() {

        return ResponseEntity.ok(
                returnRequestService.getPendingReturnRequests()
        );
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ReturnRequestResponse>
    getReturnRequestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                returnRequestService.getReturnRequestById(id)
        );
    }


    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ReturnRequestResponse>
    confirmReturn(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                returnRequestService.confirmReturn(
                        id,
                        authentication.getName()
                )
        );
    }


    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ReturnRequestResponse>
    rejectReturn(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                returnRequestService.rejectReturn(
                        id,
                        authentication.getName()
                )
        );
    }
}