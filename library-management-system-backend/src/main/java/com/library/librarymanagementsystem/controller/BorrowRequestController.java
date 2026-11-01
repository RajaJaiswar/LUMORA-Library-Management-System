package com.library.librarymanagementsystem.controller;

import com.library.librarymanagementsystem.dto.request.BorrowRequest;
import com.library.librarymanagementsystem.dto.response.BorrowRequestResponse;
import com.library.librarymanagementsystem.service.BorrowRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow-requests")
@RequiredArgsConstructor
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;


    // ==================== MEMBER ====================

    @PostMapping
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<BorrowRequestResponse> createBorrowRequest(
            @Valid @RequestBody BorrowRequest request,
            Authentication authentication) {

        BorrowRequestResponse response =
                borrowRequestService.createBorrowRequest(
                        request,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    @GetMapping("/my")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<List<BorrowRequestResponse>>
    getMyBorrowRequests(
            Authentication authentication) {

        return ResponseEntity.ok(
                borrowRequestService.getMyBorrowRequests(
                        authentication.getName()
                )
        );
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<BorrowRequestResponse> cancelBorrowRequest(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                borrowRequestService.cancelBorrowRequest(
                        id,
                        authentication.getName()
                )
        );
    }


    // ==================== ADMIN / LIBRARIAN ====================

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<BorrowRequestResponse>>
    getPendingBorrowRequests() {

        return ResponseEntity.ok(
                borrowRequestService.getPendingBorrowRequests()
        );
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<BorrowRequestResponse>
    getBorrowRequestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                borrowRequestService.getBorrowRequestById(id)
        );
    }


    @PutMapping("/{id}/issue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<BorrowRequestResponse> issueBook(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                borrowRequestService.issueBook(
                        id,
                        authentication.getName()
                )
        );
    }


    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<BorrowRequestResponse>
    rejectBorrowRequest(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                borrowRequestService.rejectBorrowRequest(
                        id,
                        authentication.getName()
                )
        );
    }
}