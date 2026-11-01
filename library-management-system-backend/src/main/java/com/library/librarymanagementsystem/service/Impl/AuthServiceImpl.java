package com.library.librarymanagementsystem.service.Impl;



import com.library.librarymanagementsystem.dto.request.LoginRequest;
import com.library.librarymanagementsystem.dto.request.RegisterRequest;
import com.library.librarymanagementsystem.dto.response.AuthResponse;
import com.library.librarymanagementsystem.dto.response.LoginResult;
import com.library.librarymanagementsystem.entity.Role;
import com.library.librarymanagementsystem.entity.User;
import com.library.librarymanagementsystem.entity.UserStatus;
import com.library.librarymanagementsystem.exception.ResourceAlreadyExistsException;
import com.library.librarymanagementsystem.exception.ResourceNotFoundException;
import com.library.librarymanagementsystem.repository.UserRepository;
import com.library.librarymanagementsystem.security.JwtService;
import com.library.librarymanagementsystem.service.AuthService;
import com.library.librarymanagementsystem.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException(
                    "Email already registered"
            );
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(UserStatus.ACTIVE)
                .role(Role.MEMBER)
                .build();

        userRepository.save(user);

        user.setLibraryMemberId(
                String.format("LIB-%06d", user.getId())
        );

        userRepository.save(user);

        return new AuthResponse(
                "User registered successfully",
                null,
                null
        );
    }



    @Override
    public LoginResult login(LoginRequest request) {

        // 1. Verify email and password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Get the authenticated user from database
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        // 3. Generate short-lived access token
        String accessToken =
                jwtService.generateToken(user.getEmail());

        // 4. Generate refresh token
        String refreshToken =
                refreshTokenService.createRefreshToken(user);

        // 5. Create response containing access token
        AuthResponse authResponse =
                new AuthResponse(
                        "Login successful",
                        accessToken,
                        "Bearer"
                );

        // 6. Return everything needed by AuthController
        return new LoginResult(
                authResponse,
                user,
                refreshToken
        );



    }

    @Override
    public void logout(String refreshToken) {

        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        refreshTokenService.revokeRefreshToken(refreshToken);
    }
}

