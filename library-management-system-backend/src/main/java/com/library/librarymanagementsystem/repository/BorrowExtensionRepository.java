package com.library.librarymanagementsystem.repository;


import com.library.librarymanagementsystem.entity.BorrowExtension;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowExtensionRepository
        extends JpaRepository<BorrowExtension, Long> {

    List<BorrowExtension> findByBorrowRecordId(Long borrowRecordId);
}
