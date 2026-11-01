package com.library.librarymanagementsystem.controller;

import com.library.librarymanagementsystem.dto.request.BorrowExtensionRequest;
import com.library.librarymanagementsystem.dto.response.BorrowExtensionResponse;
import com.library.librarymanagementsystem.dto.response.BorrowResponse;
import com.library.librarymanagementsystem.entity.BorrowStatus;
import com.library.librarymanagementsystem.service.BorrowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;


    // ==================== BORROW BOOK ====================




    // ==================== MY BORROW RECORDS ====================

    @GetMapping("/my")
    public ResponseEntity<List<BorrowResponse>> getMyBorrowRecords(
            Authentication authentication) {

        return ResponseEntity.ok(
                borrowService.getMyBorrowRecords(
                        authentication.getName()
                )
        );
    }


    @GetMapping("/my/active")
    public ResponseEntity<List<BorrowResponse>> getMyActiveBorrowRecords(
            Authentication authentication) {

        return ResponseEntity.ok(
                borrowService.getMyActiveBorrowRecords(
                        authentication.getName()
                )
        );
    }


    @GetMapping("/my/overdue")
    public ResponseEntity<List<BorrowResponse>> getMyOverdueBorrowRecords(
            Authentication authentication) {

        return ResponseEntity.ok(
                borrowService.getMyOverdueBorrowRecords(
                        authentication.getName()
                )
        );
    }


    // ==================== ADMIN / LIBRARIAN ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<BorrowResponse>> getAllBorrowRecords() {

        return ResponseEntity.ok(
                borrowService.getAllBorrowRecords()
        );
    }


    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<BorrowResponse>> getBorrowRecordsByStatus(
            @PathVariable BorrowStatus status) {

        return ResponseEntity.ok(
                borrowService.getBorrowRecordsByStatus(status)
        );
    }


    @GetMapping("/extensions")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<BorrowExtensionResponse>>
    getAllExtensionHistory() {

        return ResponseEntity.ok(
                borrowService.getAllExtensionHistory()
        );
    }


    @GetMapping("/{id}/extensions")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<BorrowExtensionResponse>>
    getExtensionHistory(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                borrowService.getExtensionHistory(id)
        );
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<BorrowResponse> getBorrowRecordById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                borrowService.getBorrowRecordById(id)
        );
    }


    // ==================== BORROW OPERATIONS ====================




    @PutMapping("/{id}/extend")
    public ResponseEntity<BorrowResponse> extendBorrow(
            @PathVariable Long id,
            @Valid @RequestBody BorrowExtensionRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                borrowService.extendBorrow(
                        id,
                        request,
                        authentication.getName()
                )
        );
    }
}
