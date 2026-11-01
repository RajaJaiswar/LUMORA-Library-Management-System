package com.library.librarymanagementsystem.service.Impl;

import com.library.librarymanagementsystem.dto.request.RoleUpdateRequest;
import com.library.librarymanagementsystem.dto.request.StatusUpdateRequest;
import com.library.librarymanagementsystem.dto.request.UserProfileUpdateRequest;
import com.library.librarymanagementsystem.dto.response.UserResponse;
import com.library.librarymanagementsystem.entity.Role;
import com.library.librarymanagementsystem.entity.User;
import com.library.librarymanagementsystem.entity.UserStatus;
import com.library.librarymanagementsystem.exception.ResourceAlreadyExistsException;
import com.library.librarymanagementsystem.exception.ResourceNotFoundException;
import com.library.librarymanagementsystem.repository.UserRepository;
import com.library.librarymanagementsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserResponse updateProfile(
            UserProfileUpdateRequest request,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        if (!user.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(
                request.getEmail())) {

            throw new ResourceAlreadyExistsException(
                    "Email already registered"
            );
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        User updatedUser =
                userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    private UserResponse mapToResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public UserResponse updateRole(
            Long userId,
            RoleUpdateRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Role currentRole = user.getRole();
        Role newRole = request.getRole();

        // Prevent removing the last active administrator
        if (currentRole == Role.ADMIN
                && user.getStatus() == UserStatus.ACTIVE
                && newRole != Role.ADMIN) {

            long activeAdminCount =
                    userRepository.countByRoleAndStatus(
                            Role.ADMIN,
                            UserStatus.ACTIVE
                    );

            if (activeAdminCount <= 1) {
                throw new IllegalArgumentException(
                        "Cannot remove the last active administrator"
                );
            }
        }

        user.setRole(newRole);

        User updatedUser =
                userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse updateStatus(
            Long userId,
            StatusUpdateRequest request,
            String adminEmail) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        UserStatus currentStatus = user.getStatus();
        UserStatus newStatus = request.getStatus();

        // Prevent admin from deactivating their own account
        if (user.getEmail().equals(adminEmail)
                && newStatus == UserStatus.INACTIVE) {

            throw new IllegalArgumentException(
                    "You cannot deactivate your own account"
            );
        }

        // Prevent deactivation of the last active administrator
        if (user.getRole() == Role.ADMIN
                && currentStatus == UserStatus.ACTIVE
                && newStatus == UserStatus.INACTIVE) {

            long activeAdminCount =
                    userRepository.countByRoleAndStatus(
                            Role.ADMIN,
                            UserStatus.ACTIVE
                    );

            if (activeAdminCount <= 1) {
                throw new IllegalArgumentException(
                        "Cannot deactivate the last active administrator"
                );
            }
        }

        user.setStatus(newStatus);

        User updatedUser =
                userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return mapToResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMyProfile(String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return mapToResponse(user);
    }
}
