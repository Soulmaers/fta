package com.football.backend.auth.dto;

public class ErrorResponse {
    private String code;
    private String message;



    public ErrorResponse(String code, String message){
this.message=message;
this.code=code;
    }


    public String getCode(){
        return code;
    }

    public String getMessage(){
        return message;
    }
}
