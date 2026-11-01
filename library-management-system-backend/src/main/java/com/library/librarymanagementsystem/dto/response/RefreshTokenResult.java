package com.library.librarymanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RefreshTokenResult {

    private String accessToken;
    private String refreshToken;
}