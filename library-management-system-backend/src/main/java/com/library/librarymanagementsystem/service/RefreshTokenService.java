package com.library.librarymanagementsystem.service;

import com.library.librarymanagementsystem.dto.response.RefreshTokenResult;
import com.library.librarymanagementsystem.entity.User;

public interface RefreshTokenService {

    String createRefreshToken(User user);

    User validateRefreshToken(String rawToken);

    RefreshTokenResult rotateRefreshToken(String rawToken);

    void revokeRefreshToken(String rawToken);
}