package com.library.librarymanagementsystem.service;

import com.library.librarymanagementsystem.dto.request.AddStockRequest;
import com.library.librarymanagementsystem.dto.request.RemoveStockRequest;
import com.library.librarymanagementsystem.entity.*;
import com.library.librarymanagementsystem.exception.StockOperationException;
import com.library.librarymanagementsystem.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CirculationConcurrencyIntegrationTest {

    @Autowired
    private BookService bookService;

    @Autowired
    private BorrowRequestService borrowRequestService;

    @Autowired
    private ReturnRequestService returnRequestService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BorrowRequestRepository borrowRequestRepository;

    @Autowired
    private ReturnRequestRepository returnRequestRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    private final List<Long> returnRequestIds = new CopyOnWriteArrayList<>();
    private final List<Long> borrowRecordIds = new CopyOnWriteArrayList<>();
    private final List<Long> borrowRequestIds = new CopyOnWriteArrayList<>();
    private final List<Long> bookIds = new CopyOnWriteArrayList<>();
    private final List<Long> userIds = new CopyOnWriteArrayList<>();

    @AfterEach
    void tearDown() {
        for (Long id : returnRequestIds) {
            returnRequestRepository.findById(id).ifPresent(returnRequestRepository::delete);
        }
        returnRequestIds.clear();

        for (Long id : borrowRecordIds) {
            borrowRecordRepository.findById(id).ifPresent(borrowRecordRepository::delete);
        }
        borrowRecordIds.clear();

        for (Long id : borrowRequestIds) {
            borrowRequestRepository.findById(id).ifPresent(borrowRequestRepository::delete);
        }
        borrowRequestIds.clear();

        for (Long id : bookIds) {
            bookRepository.findById(id).ifPresent(bookRepository::delete);
        }
        bookIds.clear();

        for (Long id : userIds) {
            userRepository.findById(id).ifPresent(userRepository::delete);
        }
        userIds.clear();
    }

    private User createTestUser(Role role) {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        User user = User.builder()
                .name("Concurrency Test " + unique)
                .email("conc_" + unique + "@test.local")
                .password("$2a$10$dummyHashForConcurrencyTest")
                .libraryMemberId("MEM-CC-" + unique)
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();
        User saved = userRepository.save(user);
        userIds.add(saved.getId());
        return saved;
    }

    private Book createTestBook(int quantity, int availableQuantity) {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        Book book = Book.builder()
                .title("Concurrency Book " + unique)
                .author("Author " + unique)
                .isbn("ISBN-CC-" + unique)
                .category("Concurrency")
                .quantity(quantity)
                .availableQuantity(availableQuantity)
                .build();
        Book saved = bookRepository.save(book);
        bookIds.add(saved.getId());
        return saved;
    }

    @Test
    void testConcurrentStockAddition_NoLostUpdates() throws Exception {
        int initialStock = 10;
        int threadCount = 10;
        Book book = createTestBook(initialStock, initialStock);

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        List<Throwable> errors = new CopyOnWriteArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    AddStockRequest request = new AddStockRequest();
                    request.setQuantity(1);
                    bookService.addStock(book.getId(), request);
                    successCount.incrementAndGet();
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean completed = doneLatch.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "All stock additions should finish within timeout");
        assertTrue(errors.isEmpty(), "Unexpected errors: " + errors);
        assertEquals(threadCount, successCount.get());

        Book updated = bookRepository.findById(book.getId()).orElseThrow();
        assertEquals(initialStock + threadCount, updated.getQuantity(), "Total quantity must reflect all additions");
        assertEquals(initialStock + threadCount, updated.getAvailableQuantity(), "Available quantity must reflect all additions");
    }

    @Test
    void testConcurrentStockRemoval_PreventsOverselling() throws Exception {
        int initialStock = 5;
        int threadCount = 10;
        Book book = createTestBook(initialStock, initialStock);

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        List<Throwable> otherErrors = new CopyOnWriteArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    RemoveStockRequest request = new RemoveStockRequest();
                    request.setQuantity(1);
                    bookService.removeStock(book.getId(), request);
                    successCount.incrementAndGet();
                } catch (StockOperationException soe) {
                    conflictCount.incrementAndGet();
                } catch (Throwable t) {
                    otherErrors.add(t);
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean completed = doneLatch.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "All stock removals should finish within timeout");
        assertTrue(otherErrors.isEmpty(), "Unexpected errors: " + otherErrors);
        assertEquals(initialStock, successCount.get(), "Exactly initialStock removals must succeed");
        assertEquals(threadCount - initialStock, conflictCount.get(), "Excess removals must throw StockOperationException");

        Book updated = bookRepository.findById(book.getId()).orElseThrow();
        assertEquals(0, updated.getQuantity(), "Quantity must reach 0");
        assertEquals(0, updated.getAvailableQuantity(), "Available quantity must never drop below 0");
    }

    @Test
    void testConcurrentIssueVsRemoveStock_RacesSafely() throws Exception {
        Book book = createTestBook(1, 1);
        User member = createTestUser(Role.MEMBER);
        User librarian = createTestUser(Role.LIBRARIAN);

        BorrowRequestRecord borrowRequest = BorrowRequestRecord.builder()
                .book(book)
                .user(member)
                .status(BorrowRequestStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();
        borrowRequest = borrowRequestRepository.save(borrowRequest);
        borrowRequestIds.add(borrowRequest.getId());

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(2);

        AtomicInteger issueSuccess = new AtomicInteger(0);
        AtomicInteger removeSuccess = new AtomicInteger(0);
        List<Throwable> errors = new CopyOnWriteArrayList<>();

        final Long reqId = borrowRequest.getId();
        final String libEmail = librarian.getEmail();
        final Long bId = book.getId();

        executor.submit(() -> {
            try {
                startLatch.await();
                borrowRequestService.issueBook(reqId, libEmail);
                issueSuccess.incrementAndGet();
            } catch (IllegalArgumentException iae) {
                // Expected if removeStock won the race
            } catch (Throwable t) {
                errors.add(t);
            } finally {
                doneLatch.countDown();
            }
        });

        executor.submit(() -> {
            try {
                startLatch.await();
                RemoveStockRequest removeReq = new RemoveStockRequest();
                removeReq.setQuantity(1);
                bookService.removeStock(bId, removeReq);
                removeSuccess.incrementAndGet();
            } catch (StockOperationException soe) {
                // Expected if issueBook won the race
            } catch (Throwable t) {
                errors.add(t);
            } finally {
                doneLatch.countDown();
            }
        });

        startLatch.countDown();
        boolean completed = doneLatch.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "Race test should finish within timeout");
        assertTrue(errors.isEmpty(), "Unexpected errors during race: " + errors);
        assertEquals(1, issueSuccess.get() + removeSuccess.get(), "Exactly one operation must win the race for the single copy");

        Book updated = bookRepository.findById(book.getId()).orElseThrow();
        assertEquals(0, updated.getAvailableQuantity(), "Available quantity must be 0 and never negative");

        // Track created borrow records if issue won so tearDown cleans it up
        List<BorrowRecord> createdRecords = borrowRecordRepository.findByUser(member);
        for (BorrowRecord br : createdRecords) {
            borrowRecordIds.add(br.getId());
        }
    }

    @Test
    void testDuplicateSimultaneousIssueBook_OnlyOneSucceeds() throws Exception {
        Book book = createTestBook(5, 5);
        User member = createTestUser(Role.MEMBER);
        User librarian = createTestUser(Role.LIBRARIAN);

        BorrowRequestRecord borrowRequest = BorrowRequestRecord.builder()
                .book(book)
                .user(member)
                .status(BorrowRequestStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();
        borrowRequest = borrowRequestRepository.save(borrowRequest);
        borrowRequestIds.add(borrowRequest.getId());

        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedNotPendingCount = new AtomicInteger(0);
        List<Throwable> otherErrors = new CopyOnWriteArrayList<>();

        final Long reqId = borrowRequest.getId();
        final String libEmail = librarian.getEmail();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    borrowRequestService.issueBook(reqId, libEmail);
                    successCount.incrementAndGet();
                } catch (IllegalArgumentException iae) {
                    if (iae.getMessage().contains("Borrow request is not pending")) {
                        rejectedNotPendingCount.incrementAndGet();
                    } else {
                        otherErrors.add(iae);
                    }
                } catch (Throwable t) {
                    otherErrors.add(t);
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean completed = doneLatch.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "Both issue attempts should complete");
        assertTrue(otherErrors.isEmpty(), "Unexpected errors: " + otherErrors);
        assertEquals(1, successCount.get(), "Exactly one issue attempt must succeed");
        assertEquals(1, rejectedNotPendingCount.get(), "Duplicate attempt must be rejected because request is no longer pending");

        Book updated = bookRepository.findById(book.getId()).orElseThrow();
        assertEquals(4, updated.getAvailableQuantity(), "Inventory must be decremented exactly once");

        List<BorrowRecord> createdRecords = borrowRecordRepository.findByUser(member);
        assertEquals(1, createdRecords.size(), "Only one borrow record should exist");
        for (BorrowRecord br : createdRecords) {
            borrowRecordIds.add(br.getId());
        }
    }

    @Test
    void testDuplicateSimultaneousConfirmReturn_OnlyOneSucceeds() throws Exception {
        Book book = createTestBook(5, 4);
        User member = createTestUser(Role.MEMBER);
        User librarian = createTestUser(Role.LIBRARIAN);

        BorrowRecord borrowRecord = BorrowRecord.builder()
                .user(member)
                .book(book)
                .issueDate(LocalDate.now().minusDays(5))
                .dueDate(LocalDate.now().plusDays(9))
                .status(BorrowStatus.BORROWED)
                .fine(0.0)
                .extensionCount(0)
                .build();
        borrowRecord = borrowRecordRepository.save(borrowRecord);
        borrowRecordIds.add(borrowRecord.getId());

        ReturnRequestRecord returnRequest = ReturnRequestRecord.builder()
                .borrowRecord(borrowRecord)
                .status(ReturnRequestStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();
        returnRequest = returnRequestRepository.save(returnRequest);
        returnRequestIds.add(returnRequest.getId());

        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger duplicateRejectionCount = new AtomicInteger(0);
        List<Throwable> otherErrors = new CopyOnWriteArrayList<>();

        final Long retReqId = returnRequest.getId();
        final String libEmail = librarian.getEmail();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    returnRequestService.confirmReturn(retReqId, libEmail);
                    successCount.incrementAndGet();
                } catch (IllegalArgumentException iae) {
                    if (iae.getMessage().contains("Return request is not pending")
                            || iae.getMessage().contains("Book has already been returned")) {
                        duplicateRejectionCount.incrementAndGet();
                    } else {
                        otherErrors.add(iae);
                    }
                } catch (Throwable t) {
                    otherErrors.add(t);
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean completed = doneLatch.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "Both return confirmations should complete");
        assertTrue(otherErrors.isEmpty(), "Unexpected errors: " + otherErrors);
        assertEquals(1, successCount.get(), "Exactly one confirm return must succeed");
        assertEquals(1, duplicateRejectionCount.get(), "Duplicate return confirmation must be rejected");

        Book updated = bookRepository.findById(book.getId()).orElseThrow();
        assertEquals(5, updated.getAvailableQuantity(), "Inventory must be incremented exactly once (restored 4 -> 5)");

        BorrowRecord updatedRecord = borrowRecordRepository.findById(borrowRecord.getId()).orElseThrow();
        assertEquals(BorrowStatus.RETURNED, updatedRecord.getStatus(), "Borrow status must be RETURNED");
    }
}
