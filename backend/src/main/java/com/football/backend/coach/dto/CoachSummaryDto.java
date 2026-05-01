package com.football.backend.coach.dto;

import com.football.backend.coach.model.Coach;

import java.time.LocalDate;

public class CoachSummaryDto {

    private Long id;
    private String fullName;
    private String profession;
    private LocalDate birthDate;
    private String photoUrl;
    private String profilType;
    private String login;
    private Long teamId;
    public CoachSummaryDto( Coach coach){
        this.id=coach.getId();
        this.fullName=coach.getFullName();
        this.profession=coach.getProfession();
        this.birthDate=coach.getBirthDate();
        this.photoUrl=coach.getPhotoUrl();
        this.profilType = coach.getProfilType().name();

        if (coach.getUser() != null) {
            this.login = coach.getUser().getLogin();
        }
        this.teamId = coach.getTeam() != null ? coach.getTeam().getId() : null;
    }



    public Long getId(){
        return id;
    }
    public String getProfession(){
        return profession;
    }
    public LocalDate getBirthDate(){
        return birthDate;
    }
    public String getPhotoUrl(){
        return photoUrl;
    }
    public String getProfilType() {
        return profilType;
    }
    public String getFullName(){
        return fullName;
    }
    public String getLogin() { return login; }
    public Long getTeamId() { return teamId; }
}
