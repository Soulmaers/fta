package com.football.backend.auth.dto;

public class RegisterManagerRequest {
    private String login;
           private String password;
    private String confirmPassword;



    public RegisterManagerRequest(){

    }

    public String getLogin(){
        return login;
    }

    public void setLogin(String login){
       this.login=login;
        // System.out.println(this.login);
    }
    public String getPassword(){
        return password;
    }
    public void setPassword(String password){
        this.password=password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
