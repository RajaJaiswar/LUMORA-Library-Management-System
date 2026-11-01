package com.library.librarymanagementsystem.repository;

import com.library.librarymanagementsystem.entity.Book;
import com.library.librarymanagementsystem.entity.BorrowRecord;
import com.library.librarymanagementsystem.entity.BorrowStatus;
import com.library.librarymanagementsystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowRecordRepository
        extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByUser(User user);

    List<BorrowRecord> findByUserAndStatus(
            User user,
            BorrowStatus status
    );

    List<BorrowRecord> findByStatus(BorrowStatus status);

    long countByBookAndStatusIn(
            Book book,
            List<BorrowStatus> statuses
    );

    boolean existsByBook(Book book);

    boolean existsByUserAndBookAndStatusIn(
            User user,
            Book book,
            List<BorrowStatus> statuses
    );
}