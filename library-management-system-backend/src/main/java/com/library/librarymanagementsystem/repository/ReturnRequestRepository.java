package com.library.librarymanagementsystem.repository;

import com.library.librarymanagementsystem.entity.BorrowRecord;
import com.library.librarymanagementsystem.entity.ReturnRequestRecord;
import com.library.librarymanagementsystem.entity.ReturnRequestStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository
        extends JpaRepository<ReturnRequestRecord, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM ReturnRequestRecord r WHERE r.id = :id")
    Optional<ReturnRequestRecord> findByIdForUpdate(@Param("id") Long id);

    long countByStatus(ReturnRequestStatus status);

    List<ReturnRequestRecord> findByBorrowRecord_UserId(
            Long userId
    );

    List<ReturnRequestRecord> findByStatus(
            ReturnRequestStatus status
    );

    boolean existsByBorrowRecordAndStatus(
            BorrowRecord borrowRecord,
            ReturnRequestStatus status
    );
}