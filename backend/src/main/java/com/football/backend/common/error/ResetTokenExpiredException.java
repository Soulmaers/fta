package com.football.backend.common.error;

public class ResetTokenExpiredException extends RuntimeException{
    public ResetTokenExpiredException(String message){
        super(message);
    }
}
