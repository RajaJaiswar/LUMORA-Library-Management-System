package com.library.librarymanagementsystem.service;


import com.library.librarymanagementsystem.dto.request.RoleUpdateRequest;
import com.library.librarymanagementsystem.dto.request.StatusUpdateRequest;
import com.library.librarymanagementsystem.dto.request.UserProfileUpdateRequest;
import com.library.librarymanagementsystem.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse updateProfile(
            UserProfileUpdateRequest request,
            String userEmail
    );

    UserResponse updateRole(Long userId, RoleUpdateRequest request);

    UserResponse updateStatus(
            Long userId,
            StatusUpdateRequest request,
            String adminEmail
    );

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long userId);

    UserResponse getMyProfile(String userEmail);
}