package com.drmp.exception;

/**
 * Resource Not Found Exception
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}