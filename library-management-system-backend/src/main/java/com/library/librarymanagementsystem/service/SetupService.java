package com.library.librarymanagementsystem.service;

import com.library.librarymanagementsystem.dto.request.AdminSetupRequest;
import com.library.librarymanagementsystem.dto.response.SetupStatusResponse;
import org.springframework.transaction.annotation.Transactional;

public interface SetupService {

    SetupStatusResponse getSetupStatus();

    void createInitialAdmin(
            AdminSetupRequest request,
            String setupToken
    );


}