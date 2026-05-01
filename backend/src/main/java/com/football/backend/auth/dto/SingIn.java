package com.football.backend.auth.dto;

public class SingIn {
    private String login;
    private String password;
    private boolean remember;



    public  SingIn(){

    }

    public String getLogin() {
        return login;
    }
    public String getPassword() {
        return password;
    }
    public boolean isRemember(){
        return remember;
    }
    public void setRemember(boolean remember){
        this.remember=remember;
    }

    public void setLogin(String login) {
        this.login=login;
    }
    public void setPassword(String password) {
        this.password=password;
    }
}
