package com.library.librarymanagementsystem.dto.request;

import com.library.librarymanagementsystem.entity.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private UserStatus status;
}
