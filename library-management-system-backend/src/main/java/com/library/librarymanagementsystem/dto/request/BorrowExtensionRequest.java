package com.library.librarymanagementsystem.dto.request;


import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BorrowExtensionRequest {

    @NotNull(message = "New due date is required")
    @Future(message = "New due date must be in the future")
    private LocalDate newDueDate;

    @NotBlank(message = "Reason is required")
    private String reason;
}