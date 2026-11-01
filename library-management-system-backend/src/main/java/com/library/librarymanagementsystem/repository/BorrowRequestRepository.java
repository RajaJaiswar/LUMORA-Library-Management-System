package com.library.librarymanagementsystem.repository;

import com.library.librarymanagementsystem.entity.Book;
import com.library.librarymanagementsystem.entity.BorrowRequestRecord;
import com.library.librarymanagementsystem.entity.BorrowRequestStatus;
import com.library.librarymanagementsystem.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BorrowRequestRepository
        extends JpaRepository<BorrowRequestRecord, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM BorrowRequestRecord r WHERE r.id = :id")
    Optional<BorrowRequestRecord> findByIdForUpdate(@Param("id") Long id);

    long countByStatus(BorrowRequestStatus status);

    List<BorrowRequestRecord> findByUser(User user);

    List<BorrowRequestRecord> findByUserAndStatus(
            User user,
            BorrowRequestStatus status
    );

    List<BorrowRequestRecord> findByStatus(
            BorrowRequestStatus status
    );

    List<BorrowRequestRecord> findByBookAndStatus(
            Book book,
            BorrowRequestStatus status
    );

    boolean existsByUserAndBookAndStatus(
            User user,
            Book book,
            BorrowRequestStatus status
    );


}