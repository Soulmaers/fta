package com.football.backend.player.dto;

import com.football.backend.player.model.Player;
import com.football.backend.player.model.PlayerGameStatus;
import com.football.backend.player.model.PlayerStatus;

import java.time.LocalDate;

public class PlayerSummaryDto {

    private Long id;
    private String fullName;
       private String position;
    private LocalDate birthDate;
    private String photoUrl;
    private Integer weight;
    private Integer height;
    private Integer number;
    private String leg;
    private String login;
    private String status;
    private String statusGame;
    private Long teamId;
    private Long lineupId;
    private Integer fatherHeight;
    private Integer motherHeight;

    public PlayerSummaryDto(Player player){
        this.id=player.getId();
        this.fullName=player.getFullName();
        this.position=player.getPosition();
        this.birthDate=player.getBirthDate();
        this.photoUrl=player.getPhotoUrl();
        this.weight = player.getWeight();
        this.height = player.getHeight();
        this.leg = player.getLeg();
        this.number = player.getNumber();
        this.status = player.getStatus().name();
        this.statusGame = player.getStatusGame().name();
        
        if (player.getUser() != null) {
            this.login = player.getUser().getLogin();
        }
        this.teamId = player.getTeam() != null ? player.getTeam().getId() : null;
         this.lineupId = player.getLineup() != null ? player.getLineup().getId() : null;
        this.fatherHeight = player.getFatherHeight();
        this.motherHeight = player.getMotherHeight();
    }

    public Long getId(){
        return id;
    }
    public String getFullName(){
        return fullName;
    }
      public String getPosition() { return position; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getPhotoUrl() { return photoUrl; }
    public Integer getWeight() { return weight; }
    public Integer getHeight() { return height; }
    public Integer getNumber() { return number; }
    public String getLeg() { return leg; }
    public String getStatus() { return status; }
    public String getStatusGame() { return statusGame; }
    public String getLogin() { return login; }
    public Long getTeamId() { return teamId; }
     public Long getLineupId() { return lineupId; }
    public Integer getFatherHeight() { return fatherHeight; }
    public Integer getMotherHeight() { return motherHeight; }
}
