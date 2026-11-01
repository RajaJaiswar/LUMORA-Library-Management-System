package com.library.librarymanagementsystem.service.Impl;

import com.library.librarymanagementsystem.dto.response.RefreshTokenResult;
import com.library.librarymanagementsystem.entity.RefreshToken;
import com.library.librarymanagementsystem.entity.User;
import com.library.librarymanagementsystem.exception.ResourceNotFoundException;
import com.library.librarymanagementsystem.repository.RefreshTokenRepository;
import com.library.librarymanagementsystem.security.JwtService;
import com.library.librarymanagementsystem.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final long REFRESH_TOKEN_DAYS = 7;

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @Override
    @Transactional
    public String createRefreshToken(User user) {

        String rawToken = UUID.randomUUID().toString()
                + UUID.randomUUID();

        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(tokenHash)
                .user(user)
                .expiresAt(
                        LocalDateTime.now()
                                .plusDays(REFRESH_TOKEN_DAYS)
                )
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    @Override
    @Transactional(readOnly = true)
    public User validateRefreshToken(String rawToken) {

        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken =
                refreshTokenRepository
                        .findByTokenHashAndRevokedFalse(tokenHash)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid refresh token"
                                ));

        if (refreshToken.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Refresh token has expired"
            );
        }

        if (refreshToken.getUser().getStatus()
                != com.library.librarymanagementsystem.entity.UserStatus.ACTIVE) {

            throw new IllegalArgumentException(
                    "User account is inactive"
            );
        }

        return refreshToken.getUser();
    }

    @Override
    @Transactional
    public RefreshTokenResult rotateRefreshToken(
            String rawToken) {

        User user = validateRefreshToken(rawToken);

        revokeRefreshToken(rawToken);

        String newRefreshToken =
                createRefreshToken(user);

        String newAccessToken =
                jwtService.generateToken(user.getEmail());

        return new RefreshTokenResult(
                newAccessToken,
                newRefreshToken
        );
    }

    @Override
    @Transactional
    public void revokeRefreshToken(String rawToken) {

        String tokenHash = hashToken(rawToken);

        refreshTokenRepository
                .findByTokenHashAndRevokedFalse(tokenHash)
                .ifPresent(refreshToken -> {
                    refreshToken.setRevoked(true);
                    refreshTokenRepository.save(refreshToken);
                });
    }

    private String hashToken(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            token.getBytes(StandardCharsets.UTF_8)
                    );

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(hash);

        } catch (NoSuchAlgorithmException e) {

            throw new IllegalStateException(
                    "SHA-256 algorithm not available",
                    e
            );
        }
    }
}