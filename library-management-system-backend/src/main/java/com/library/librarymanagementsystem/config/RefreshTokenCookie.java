package com.library.librarymanagementsystem.config;

import jakarta.servlet.http.Cookie;

public class RefreshTokenCookie {

    private static final String COOKIE_NAME = "refreshToken";

    private RefreshTokenCookie() {
    }

    public static Cookie create(String refreshToken) {

        Cookie cookie = new Cookie(
                COOKIE_NAME,
                refreshToken
        );

        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(7 * 24 * 60 * 60);

        return cookie;
    }

    public static Cookie clear() {

        Cookie cookie = new Cookie(
                COOKIE_NAME,
                ""
        );

        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0);

        return cookie;
    }
}
