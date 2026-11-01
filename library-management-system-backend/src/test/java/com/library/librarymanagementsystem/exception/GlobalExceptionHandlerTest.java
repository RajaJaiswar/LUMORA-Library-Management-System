package com.library.librarymanagementsystem.exception;

import com.library.librarymanagementsystem.dto.response.ErrorResponse;
import org.hibernate.exception.LockAcquisitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private MockMvc mockMvc;

    @RestController
    static class TestLockingController {
        @GetMapping("/test/lock-timeout")
        public void throwLockTimeout() {
            throw new CannotAcquireLockException(
                    "Lock wait timeout exceeded; try restarting transaction",
                    new SQLException("Lock wait timeout exceeded", "40001", 1205)
            );
        }

        @GetMapping("/test/stock-conflict")
        public void throwStockConflict() {
            throw new StockOperationException("Cannot remove 10 copies. Only 2 available.");
        }

        @GetMapping("/test/not-found")
        public void throwNotFound() {
            throw new ResourceNotFoundException("Book not found with id: 99");
        }

        @GetMapping("/test/bad-request")
        public void throwBadRequest() {
            throw new IllegalArgumentException("Borrow request is not pending");
        }

        @GetMapping("/test/tx-wrapped-lock-timeout")
        public void throwTxWrappedLockTimeout() {
            throw new org.springframework.transaction.TransactionSystemException(
                    "Could not commit JPA transaction",
                    new jakarta.persistence.RollbackException(
                            "Transaction rolled back",
                            new CannotAcquireLockException(
                                    "Lock wait timeout exceeded",
                                    new SQLException("Lock wait timeout exceeded", "40001", 1205)
                            )
                    )
            );
        }

        @GetMapping("/test/tx-wrapped-deadlock")
        public void throwTxWrappedDeadlock() {
            throw new org.springframework.transaction.TransactionSystemException(
                    "Could not commit JPA transaction",
                    new LockAcquisitionException(
                            "Deadlock found when trying to get lock",
                            new SQLException("Deadlock found when trying to get lock", "40001", 1213)
                    )
            );
        }
    }

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        mockMvc = MockMvcBuilders
                .standaloneSetup(new TestLockingController())
                .setControllerAdvice(exceptionHandler)
                .build();
    }

    @Test
    void handleLockContention_PessimisticLockingFailureException_Returns409() {
        PessimisticLockingFailureException ex =
                new PessimisticLockingFailureException("Pessimistic lock could not be obtained");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleLockContention(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Conflict", response.getBody().getError());
        assertEquals(
                "The requested resource is currently locked by another operation. Please retry your request.",
                response.getBody().getMessage()
        );
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void handleLockContention_CannotAcquireLockException_Returns409() {
        CannotAcquireLockException ex = new CannotAcquireLockException(
                "Lock wait timeout exceeded; try restarting transaction",
                new SQLException("Lock wait timeout exceeded", "40001", 1205)
        );

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleLockContention(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Conflict", response.getBody().getError());
        assertEquals(
                "The requested resource is currently locked by another operation. Please retry your request.",
                response.getBody().getMessage()
        );
        // Verify database error code/SQL is not exposed
        assertFalse(response.getBody().getMessage().contains("1205"));
        assertFalse(response.getBody().getMessage().contains("SQLException"));
    }

    @Test
    void handleLockContention_JpaPessimisticLockException_Returns409() {
        jakarta.persistence.PessimisticLockException ex =
                new jakarta.persistence.PessimisticLockException("Row lock failed");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleLockContention(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().getStatus());
    }

    @Test
    void handleLockContention_JpaLockTimeoutException_Returns409() {
        jakarta.persistence.LockTimeoutException ex =
                new jakarta.persistence.LockTimeoutException("Lock timeout");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleLockContention(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().getStatus());
    }

    @Test
    void handleLockContention_HibernateLockAcquisitionException_Returns409() {
        LockAcquisitionException ex = new LockAcquisitionException(
                "could not execute statement",
                new SQLException("Deadlock found when trying to get lock", "40001", 1213)
        );

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleLockContention(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().getStatus());
    }

    @Test
    void handleResourceNotFound_Preserves404() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Book not found with id: 42");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceNotFound(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(404, response.getBody().getStatus());
        assertEquals("Not Found", response.getBody().getError());
        assertEquals("Book not found with id: 42", response.getBody().getMessage());
    }

    @Test
    void handleIllegalArgument_Preserves400() {
        IllegalArgumentException ex = new IllegalArgumentException("Borrow request is not pending");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleIllegalArgument(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("Bad Request", response.getBody().getError());
        assertEquals("Borrow request is not pending", response.getBody().getMessage());
    }

    @Test
    void handleStockOperation_Preserves409() {
        StockOperationException ex = new StockOperationException("Cannot remove 5 copies. Only 2 available.");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleStockOperation(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Conflict", response.getBody().getError());
        assertEquals("Cannot remove 5 copies. Only 2 available.", response.getBody().getMessage());
    }

    @Test
    void handleResourceAlreadyExists_Preserves409() {
        ResourceAlreadyExistsException ex = new ResourceAlreadyExistsException("Book with ISBN already exists");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceAlreadyExists(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Conflict", response.getBody().getError());
        assertEquals("Book with ISBN already exists", response.getBody().getMessage());
    }

    @Test
    void handleBookDeletion_Preserves409() {
        BookDeletionException ex = new BookDeletionException("Book cannot be deleted because it has borrowing history");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleBookDeletion(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Conflict", response.getBody().getError());
        assertEquals("Book cannot be deleted because it has borrowing history", response.getBody().getMessage());
    }

    @Test
    void handleValidationException_Preserves400() throws NoSuchMethodException {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "testObject");
        bindingResult.addError(new FieldError("testObject", "title", "Title is mandatory"));

        MethodParameter parameter = new MethodParameter(
                GlobalExceptionHandlerTest.class.getDeclaredMethod("setUp"), -1
        );
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleValidationException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("Bad Request", response.getBody().getError());
        assertEquals("Title is mandatory", response.getBody().getMessage());
    }

    // --- MockMvc Dispatcher Tests ---

    @Test
    void mockMvc_DispatchesLockTimeoutTo409Conflict() throws Exception {
        mockMvc.perform(get("/test/lock-timeout").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value(
                        "The requested resource is currently locked by another operation. Please retry your request."
                ))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void mockMvc_DispatchesStockConflictTo409() throws Exception {
        mockMvc.perform(get("/test/stock-conflict").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Cannot remove 10 copies. Only 2 available."));
    }

    @Test
    void mockMvc_DispatchesNotFoundTo404() throws Exception {
        mockMvc.perform(get("/test/not-found").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Book not found with id: 99"));
    }

    @Test
    void mockMvc_DispatchesBadRequestTo400() throws Exception {
        mockMvc.perform(get("/test/bad-request").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Borrow request is not pending"));
    }

    @Test
    void handleTransactionSystemException_WrappedLockTimeout_Returns409() {
        CannotAcquireLockException lockEx = new CannotAcquireLockException(
                "Lock wait timeout exceeded",
                new SQLException("Lock wait timeout exceeded", "40001", 1205)
        );
        org.springframework.transaction.TransactionSystemException txEx =
                new org.springframework.transaction.TransactionSystemException(
                        "Could not commit JPA transaction",
                        new jakarta.persistence.RollbackException("Rollback", lockEx)
                );

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleTransactionSystemException(txEx);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Conflict", response.getBody().getError());
        assertEquals(
                "The requested resource is currently locked by another operation. Please retry your request.",
                response.getBody().getMessage()
        );
    }

    @Test
    void handleTransactionSystemException_WrappedDeadlock_Returns409() {
        LockAcquisitionException deadlockEx = new LockAcquisitionException(
                "Deadlock found when trying to get lock",
                new SQLException("Deadlock found when trying to get lock", "40001", 1213)
        );
        org.springframework.transaction.TransactionSystemException txEx =
                new org.springframework.transaction.TransactionSystemException(
                        "Could not commit JPA transaction",
                        deadlockEx
                );

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleTransactionSystemException(txEx);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().getStatus());
    }

    @Test
    void handleTransactionSystemException_UnrelatedError_RethrowsException() {
        org.springframework.transaction.TransactionSystemException txEx =
                new org.springframework.transaction.TransactionSystemException(
                        "Could not commit JPA transaction",
                        new IllegalStateException("Unrelated commit failure")
                );

        assertThrows(org.springframework.transaction.TransactionSystemException.class, () ->
                exceptionHandler.handleTransactionSystemException(txEx)
        );
    }

    @Test
    void mockMvc_DispatchesTransactionWrappedLockTimeoutTo409() throws Exception {
        mockMvc.perform(get("/test/tx-wrapped-lock-timeout").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value(
                        "The requested resource is currently locked by another operation. Please retry your request."
                ));
    }

    @Test
    void mockMvc_DispatchesTransactionWrappedDeadlockTo409() throws Exception {
        mockMvc.perform(get("/test/tx-wrapped-deadlock").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value(
                        "The requested resource is currently locked by another operation. Please retry your request."
                ));
    }
}
