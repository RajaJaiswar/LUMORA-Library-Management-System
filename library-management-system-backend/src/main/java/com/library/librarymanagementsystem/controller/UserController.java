package com.library.librarymanagementsystem.controller;

import com.library.librarymanagementsystem.dto.request.RoleUpdateRequest;
import com.library.librarymanagementsystem.dto.request.StatusUpdateRequest;
import com.library.librarymanagementsystem.dto.request.UserProfileUpdateRequest;
import com.library.librarymanagementsystem.dto.response.UserResponse;
import com.library.librarymanagementsystem.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    // ==================== GET OPERATIONS ====================

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(
            Authentication authentication) {

        return ResponseEntity.ok(
                userService.getMyProfile(
                        authentication.getName()
                )
        );
    }


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userService.getUserById(id)
        );
    }


    // ==================== UPDATE PROFILE ====================

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UserProfileUpdateRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                userService.updateProfile(
                        request,
                        authentication.getName()
                )
        );
    }


    // ==================== ADMIN ROLE MANAGEMENT ====================

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {

        return ResponseEntity.ok(
                userService.updateRole(id, request)
        );
    }


    // ==================== ADMIN STATUS MANAGEMENT ====================

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                userService.updateStatus(
                        id,
                        request,
                        authentication.getName()
                )
        );
    }
}