package com.football.backend.auth.dto;

public class ForgotPasswordRequest {

    private String login;


    public  ForgotPasswordRequest(){

    }


    public void setLogin(String login){
       this.login=login;
    }
    public String getLogin(){
        return login;
    }
}
