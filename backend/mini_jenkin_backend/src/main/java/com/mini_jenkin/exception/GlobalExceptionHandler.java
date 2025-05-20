package com.mini_jenkin.exception;

import jakarta.persistence.ElementCollection;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> allExceptionHandler(Exception exception) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("Internal Server Error")
                .detail(exception.getLocalizedMessage())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    @ExceptionHandler(InvalidCredentialException.class)
    public ResponseEntity<?> invalidCredentialExceptionHandler(InvalidCredentialException exception) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("Invalid credentials")
                .detail(exception.getLocalizedMessage())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @ExceptionHandler(InvalidGithubUrlException.class)
    public ResponseEntity<?> invalidGithubUrlExceptionHandler(InvalidGithubUrlException exception) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("Invalid github url")
                .detail(exception.getLocalizedMessage())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(DuplicateEntryException.class)
    public ResponseEntity<?> duplicateEntryExceptionHandler(DuplicateEntryException exception) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("Duplicate Entry")
                .detail(exception.getLocalizedMessage())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> resourceNotFoundExceptionHandler(ResourceNotFoundException exception) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("Resource not found")
                .detail(exception.getLocalizedMessage())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

}
