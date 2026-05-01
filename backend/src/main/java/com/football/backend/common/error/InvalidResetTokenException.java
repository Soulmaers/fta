package com.football.backend.common.error;

public class InvalidResetTokenException extends RuntimeException{

    public InvalidResetTokenException(String message){
        super(message);
    }
}
