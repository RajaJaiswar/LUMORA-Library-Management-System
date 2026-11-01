package com.library.librarymanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;


@Getter
@AllArgsConstructor
public class BookImportResponse {

    private int totalRows;
    private int created;
    private int updated;
    private int unchanged;
    private int failed;
    private List<BookImportError> errors;
}