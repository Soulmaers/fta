package com.football.backend.common.error;

public class PasswordMismatchException extends RuntimeException{


    public PasswordMismatchException(String message){
       super(message);
    }


}
