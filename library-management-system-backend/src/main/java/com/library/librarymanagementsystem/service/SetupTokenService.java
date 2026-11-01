package com.library.librarymanagementsystem.service;

public interface SetupTokenService {

    String generateAndStoreToken();

    boolean validateToken(String rawToken);
}