package com.library.librarymanagementsystem.config;

import com.library.librarymanagementsystem.entity.SystemConfiguration;
import com.library.librarymanagementsystem.repository.SystemConfigurationRepository;
import com.library.librarymanagementsystem.service.SetupTokenService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SetupInitializer implements CommandLineRunner {

    private final SystemConfigurationRepository systemConfigurationRepository;
    private final SetupTokenService setupTokenService;

    @Value("${app.setup.regenerate-token:false}")
    private boolean regenerateToken;

    @Override
    public void run(String @NonNull ... args) {

        SystemConfiguration configuration =
                systemConfigurationRepository.findAll()
                        .stream()
                        .findFirst()
                        .orElse(null);

        // --------------------------------------------------
        // SETUP ALREADY COMPLETED
        // --------------------------------------------------

        if (configuration != null
                && configuration.isInitialSetupCompleted()) {

            return;
        }

        // --------------------------------------------------
        // CREATE CONFIGURATION IF IT DOES NOT EXIST
        // --------------------------------------------------

        if (configuration == null) {

            configuration = SystemConfiguration.builder()
                    .initialSetupCompleted(false)
                    .setupTokenUsed(false)
                    .build();

            configuration =
                    systemConfigurationRepository.save(configuration);
        }

        // --------------------------------------------------
        // TOKEN REGENERATION
        // --------------------------------------------------

        if (regenerateToken) {

            String newSetupToken =
                    setupTokenService.generateAndStoreToken();

            printSetupToken(
                    newSetupToken,
                    true
            );

            return;
        }

        // --------------------------------------------------
        // EXISTING UNUSED TOKEN
        // --------------------------------------------------

        if (configuration.getSetupTokenHash() != null
                && !configuration.isSetupTokenUsed()) {

            System.out.println();
            System.out.println(
                    "========================================================"
            );
            System.out.println(
                    " LIBRARY MANAGEMENT SYSTEM - INITIAL SETUP"
            );
            System.out.println(
                    "========================================================"
            );
            System.out.println(
                    " Initial setup is required."
            );
            System.out.println(
                    " A setup token already exists."
            );
            System.out.println(
                    " If the token has been lost, restart the application"
            );
            System.out.println(
                    " with app.setup.regenerate-token=true"
            );
            System.out.println(
                    "========================================================"
            );

            return;
        }

        // --------------------------------------------------
        // FIRST TOKEN GENERATION
        // --------------------------------------------------

        String setupToken =
                setupTokenService.generateAndStoreToken();

        printSetupToken(
                setupToken,
                false
        );
    }

    private void printSetupToken(
            String setupToken,
            boolean regenerated) {

        System.out.println();
        System.out.println(
                "========================================================"
        );
        System.out.println(
                " LIBRARY MANAGEMENT SYSTEM - INITIAL SETUP"
        );
        System.out.println(
                "========================================================"
        );

        if (regenerated) {
            System.out.println(
                    " A NEW SETUP TOKEN HAS BEEN GENERATED."
            );
        } else {
            System.out.println(
                    " Initial setup is required."
            );
        }

        System.out.println();
        System.out.println(
                " Setup Token:"
        );

        System.out.println(
                " " + setupToken
        );

        System.out.println();
        System.out.println(
                " Use this token to create the first ADMIN."
        );

        System.out.println(
                " This token can be used only once."
        );

        System.out.println(
                "========================================================"
        );
        System.out.println();
    }
}