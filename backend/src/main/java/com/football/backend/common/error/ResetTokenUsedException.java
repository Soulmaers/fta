package com.football.backend.common.error;

public class ResetTokenUsedException extends  RuntimeException{

    public  ResetTokenUsedException(String message){
        super(message);
    }
}
