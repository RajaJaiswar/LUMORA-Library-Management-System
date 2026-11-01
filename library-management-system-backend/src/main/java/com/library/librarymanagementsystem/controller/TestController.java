package com.library.librarymanagementsystem.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {


    // ==================== AUTHENTICATION TEST ====================

    @GetMapping("/protected")
    public String protectedEndpoint() {

        return "Authenticated user";
    }


    // ==================== ADMIN AUTHORIZATION TEST ====================

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminEndpoint() {

        return "Admin access granted";
    }


    // ==================== LIBRARIAN AUTHORIZATION TEST ====================

    @GetMapping("/librarian")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public String librarianEndpoint() {

        return "Librarian access granted";
    }
}