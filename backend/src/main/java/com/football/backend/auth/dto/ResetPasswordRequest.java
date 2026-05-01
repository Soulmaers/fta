package com.football.backend.auth.dto;

public class ResetPasswordRequest {
   private String token;
    private String newPassword;
    private String confirmPassword;

    public ResetPasswordRequest(){

    }


    public String getToken(){
        return token;
    }
    public String getPassword(){
        return newPassword;
    }
    public String getConfirmPassword(){
        return confirmPassword;
    }

    public void setToken(String token){
        this.token=token;
    }
    public void setPassword(String newPassword){
        this.newPassword=newPassword;
    }
    public void setConfirmPassword(String confirmPassword){
        this.confirmPassword=confirmPassword;
    }
}
