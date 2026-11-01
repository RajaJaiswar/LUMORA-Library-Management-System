package com.library.librarymanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BookImportError {

    private int row;
    private String message;
}
