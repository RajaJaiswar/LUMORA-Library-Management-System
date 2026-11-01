package com.library.librarymanagementsystem.service;

import com.library.librarymanagementsystem.dto.request.LoginRequest;
import com.library.librarymanagementsystem.dto.request.RegisterRequest;
import com.library.librarymanagementsystem.dto.response.AuthResponse;
import com.library.librarymanagementsystem.dto.response.LoginResult;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    LoginResult login(LoginRequest request);

    void logout(String refreshToken);
}
