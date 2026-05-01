package com.football.backend.common.error;

import com.football.backend.auth.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.HttpRequestMethodNotSupportedException;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request
    ) {
        System.err.println("Method Not Supported: " + ex.getMethod() + " for URI: " + request.getRequestURI());
        ErrorResponse error = new ErrorResponse(
                "METHOD_NOT_ALLOWED",
                "Method '" + ex.getMethod() + "' is not supported for this endpoint."
        );
        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(error);
    }

    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<ErrorResponse> handlePasswordMismatch(
            PasswordMismatchException ex
    ) {
        ErrorResponse error = new ErrorResponse(
                "PASSWORD_MISMATCH",
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }

    @ExceptionHandler(LoginAlreadyTakenException.class)
    public ResponseEntity<ErrorResponse> handleLoginAlreadyTaken(
            LoginAlreadyTakenException ex
    ) {
        ErrorResponse error = new ErrorResponse(
                "LOGIN_TAKEN",
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(error);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(
            UserNotFoundException ex
    ) {
        ErrorResponse error = new ErrorResponse(
                "USER_NOT_FOUND",
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(error);
    }
    @ExceptionHandler(InvalidResetTokenException.class)
    public ResponseEntity<ErrorResponse> resetTokenException(
            InvalidResetTokenException ex
    ) {
        ErrorResponse error = new ErrorResponse(
                "TOKEN_NOT_VALID",
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }
    @ExceptionHandler(ResetTokenExpiredException.class)
    public ResponseEntity<ErrorResponse> tokenExpiredException(
            ResetTokenExpiredException ex
    ) {
        ErrorResponse error = new ErrorResponse(
                "TOKEN_TIME_OUT",
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }
    @ExceptionHandler(ResetTokenUsedException.class)
    public ResponseEntity<ErrorResponse> tokenUsedException(
            ResetTokenUsedException ex
    ) {
        ErrorResponse error = new ErrorResponse(
                "TOKEN_USED",
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRefreshToken(
            InvalidRefreshTokenException ex
    ) {
        ErrorResponse error = new ErrorResponse(
                "UNAUTHORIZED",
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(error);
    }
}
