package com.library.librarymanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SetupStatusResponse {

    private boolean setupRequired;
    private boolean setupCompleted;
}