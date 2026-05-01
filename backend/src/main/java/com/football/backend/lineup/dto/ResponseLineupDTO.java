package com.football.backend.lineup.dto;


import com.football.backend.lineup.model.Lineup;

public class ResponseLineupDTO {
    private String lineupName;
private Long id;


    public ResponseLineupDTO(Lineup lineup){
        this.id=lineup.getId();
this.lineupName=lineup.getLineupName();
    }

    public Long getId(){ return id; }
    public String getLineupName(){return lineupName;}

}
