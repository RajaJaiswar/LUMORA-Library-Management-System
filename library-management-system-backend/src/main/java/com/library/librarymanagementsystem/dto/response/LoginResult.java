package com.library.librarymanagementsystem.dto.response;

import com.library.librarymanagementsystem.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResult {

    private AuthResponse authResponse;

    private User user;

    private String refreshToken;
}