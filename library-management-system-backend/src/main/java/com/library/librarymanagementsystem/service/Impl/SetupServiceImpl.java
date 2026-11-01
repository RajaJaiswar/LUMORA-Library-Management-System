package com.library.librarymanagementsystem.service.Impl;

import com.library.librarymanagementsystem.dto.request.AdminSetupRequest;
import com.library.librarymanagementsystem.dto.response.SetupStatusResponse;
import com.library.librarymanagementsystem.entity.Role;
import com.library.librarymanagementsystem.entity.SystemConfiguration;
import com.library.librarymanagementsystem.entity.User;
import com.library.librarymanagementsystem.entity.UserStatus;
import com.library.librarymanagementsystem.exception.ResourceAlreadyExistsException;
import com.library.librarymanagementsystem.repository.SystemConfigurationRepository;
import com.library.librarymanagementsystem.repository.UserRepository;
import com.library.librarymanagementsystem.service.SetupService;
import com.library.librarymanagementsystem.service.SetupTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SetupServiceImpl implements SetupService {

    private final SystemConfigurationRepository systemConfigurationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SetupTokenService setupTokenService;

    @Override
    @Transactional
    public SetupStatusResponse getSetupStatus() {

        SystemConfiguration configuration =
                getOrCreateConfiguration();

        return SetupStatusResponse.builder()
                .setupRequired(!configuration.isInitialSetupCompleted())
                .setupCompleted(configuration.isInitialSetupCompleted())
                .build();
    }

    @Transactional
    @Override
    public synchronized void createInitialAdmin(
            AdminSetupRequest request,
            String setupToken) {

        SystemConfiguration configuration =
                getOrCreateConfiguration();

        if (configuration.isInitialSetupCompleted()) {
            throw new ResourceAlreadyExistsException(
                    "Initial system setup has already been completed"
            );
        }

        if (setupToken == null || setupToken.isBlank()) {
            throw new IllegalArgumentException(
                    "Setup token is required"
            );
        }

        if (!setupTokenService.validateToken(setupToken)) {
            throw new IllegalArgumentException(
                    "Invalid or expired setup token"
            );
        }

        if (userRepository.existsByRole(Role.ADMIN)) {
            throw new ResourceAlreadyExistsException(
                    "An administrator already exists"
            );
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException(
                    "Email already registered"
            );
        }

        User admin = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(admin);

        admin.setLibraryMemberId(
                String.format("LIB-%06d", admin.getId())
        );

        userRepository.save(admin);

        configuration.setInitialSetupCompleted(true);
        configuration.setSetupCompletedAt(LocalDateTime.now());
        configuration.setSetupTokenUsed(true);

        systemConfigurationRepository.save(configuration);
    }

    private SystemConfiguration getOrCreateConfiguration() {

        return systemConfigurationRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> {

                    SystemConfiguration configuration =
                            SystemConfiguration.builder()
                                    .initialSetupCompleted(false)
                                    .build();

                    return systemConfigurationRepository.save(configuration);
                });
    }
}
