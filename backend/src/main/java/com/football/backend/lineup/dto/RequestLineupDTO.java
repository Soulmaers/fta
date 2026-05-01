package com.football.backend.lineup.dto;



public class RequestLineupDTO {
    private String lineupName;

    public RequestLineupDTO(){

    }

    public String getLineupName(){return lineupName;}
    public void setLineupName(String lineupName){this.lineupName=lineupName;}
}
