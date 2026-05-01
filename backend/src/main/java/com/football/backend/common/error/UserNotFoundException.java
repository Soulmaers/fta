package com.football.backend.common.error;

public class UserNotFoundException extends RuntimeException{


    public UserNotFoundException(String message){
        super(message);
    }
}
