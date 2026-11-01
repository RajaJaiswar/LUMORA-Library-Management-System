package com.library.librarymanagementsystem.controller;

import com.library.librarymanagementsystem.config.RefreshTokenCookie;
import com.library.librarymanagementsystem.dto.request.LoginRequest;
import com.library.librarymanagementsystem.dto.request.RegisterRequest;
import com.library.librarymanagementsystem.dto.response.AuthResponse;
import com.library.librarymanagementsystem.dto.response.LoginResult;
import com.library.librarymanagementsystem.dto.response.RefreshTokenResult;
import com.library.librarymanagementsystem.entity.User;
import com.library.librarymanagementsystem.security.JwtService;
import com.library.librarymanagementsystem.service.AuthService;
import com.library.librarymanagementsystem.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(
                authService.register(request)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        LoginResult result =
                authService.login(request);

        response.addCookie(
                RefreshTokenCookie.create(
                        result.getRefreshToken()
                )
        );

        return ResponseEntity.ok(
                result.getAuthResponse()
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {

        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            throw new IllegalArgumentException(
                    "Refresh token not found"
            );
        }

        String refreshToken = null;

        for (Cookie cookie : cookies) {

            if ("refreshToken".equals(cookie.getName())) {
                refreshToken = cookie.getValue();
                break;
            }
        }

        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new IllegalArgumentException(
                    "Refresh token not found"
            );
        }

        RefreshTokenResult result =
                refreshTokenService.rotateRefreshToken(
                        refreshToken
                );

        response.addCookie(
                RefreshTokenCookie.create(
                        result.getRefreshToken()
                )
        );

        return ResponseEntity.ok(
                new AuthResponse(
                        "Token refreshed successfully",
                        result.getAccessToken(),
                        "Bearer"
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        String refreshToken = null;

        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        authService.logout(refreshToken);

        response.addCookie(RefreshTokenCookie.clear());

        return ResponseEntity.noContent().build();
    }
}
