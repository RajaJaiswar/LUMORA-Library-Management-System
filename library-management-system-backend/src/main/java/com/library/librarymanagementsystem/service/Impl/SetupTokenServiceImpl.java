package com.library.librarymanagementsystem.service.Impl;

import com.library.librarymanagementsystem.entity.SystemConfiguration;
import com.library.librarymanagementsystem.repository.SystemConfigurationRepository;
import com.library.librarymanagementsystem.service.SetupTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class SetupTokenServiceImpl implements SetupTokenService {

    private final SystemConfigurationRepository systemConfigurationRepository;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom SECURE_RANDOM =
            new SecureRandom();

    private static final String CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private static final int TOKEN_LENGTH = 32;

    @Override
    @Transactional
    public String generateAndStoreToken() {

        SystemConfiguration configuration =
                getOrCreateConfiguration();

        if (configuration.isInitialSetupCompleted()) {
            throw new IllegalStateException(
                    "Initial system setup has already been completed"
            );
        }

        String rawToken = generateRandomToken();

        configuration.setSetupTokenHash(
                passwordEncoder.encode(rawToken)
        );

        configuration.setSetupTokenUsed(false);

        systemConfigurationRepository.save(configuration);

        return rawToken;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateToken(String rawToken) {

        SystemConfiguration configuration =
                systemConfigurationRepository.findAll()
                        .stream()
                        .findFirst()
                        .orElse(null);

        if (configuration == null) {
            return false;
        }

        if (configuration.isInitialSetupCompleted()) {
            return false;
        }

        if (configuration.isSetupTokenUsed()) {
            return false;
        }

        if (configuration.getSetupTokenHash() == null) {
            return false;
        }

        return passwordEncoder.matches(
                rawToken,
                configuration.getSetupTokenHash()
        );
    }

    private String generateRandomToken() {

        StringBuilder token = new StringBuilder();

        for (int i = 0; i < TOKEN_LENGTH; i++) {

            int index = SECURE_RANDOM.nextInt(
                    CHARACTERS.length()
            );

            token.append(CHARACTERS.charAt(index));
        }

        return token.toString();
    }

    private SystemConfiguration getOrCreateConfiguration() {

        return systemConfigurationRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> {

                    SystemConfiguration configuration =
                            SystemConfiguration.builder()
                                    .initialSetupCompleted(false)
                                    .setupTokenUsed(false)
                                    .build();

                    return systemConfigurationRepository.save(
                            configuration
                    );
                });
    }
}