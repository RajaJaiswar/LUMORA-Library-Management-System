package com.library.librarymanagementsystem.controller;

import com.library.librarymanagementsystem.dto.request.AdminSetupRequest;
import com.library.librarymanagementsystem.dto.response.SetupStatusResponse;
import com.library.librarymanagementsystem.service.SetupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/setup")
@RequiredArgsConstructor
public class SetupController {

    private final SetupService setupService;

    @GetMapping("/status")
    public ResponseEntity<SetupStatusResponse> getSetupStatus() {

        return ResponseEntity.ok(
                setupService.getSetupStatus()
        );
    }

    @PostMapping("/admin")
    public ResponseEntity<Void> createInitialAdmin(
            @Valid @RequestBody AdminSetupRequest request,
            @RequestHeader("X-Setup-Token") String setupToken) {

        setupService.createInitialAdmin(
                request,
                setupToken
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }
}