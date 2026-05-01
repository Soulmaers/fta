package com.football.backend.common.error;

public class LoginAlreadyTakenException extends RuntimeException{


    public LoginAlreadyTakenException(String message){
        super(message);
    }
}
