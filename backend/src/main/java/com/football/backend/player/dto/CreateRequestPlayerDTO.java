package com.football.backend.player.dto;

import com.football.backend.coach.model.Coach;

import java.time.LocalDate;

public class CreateRequestPlayerDTO {

    private String fullName;
    private String position;
    private LocalDate birthDate;
    private String photoUrl;
    private Integer weight;
    private Integer height;
    private Integer number;
    private String leg;

    public CreateRequestPlayerDTO() {

    }



    public String getFullName() { return fullName; }
    public String getPosition() { return position; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getPhotoUrl() { return photoUrl; }
    public Integer getWeight() { return weight; }
    public Integer getHeight() { return height; }
    public Integer getNumber() { return number; }
    public String getLeg() { return leg; }

    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setPosition(String position) { this.position = position; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public void setWeight(Integer weight) { this.weight = weight; }
    public void setHeight(Integer height) { this.height = height; }
    public void setNumber(Integer number) { this.number = number; }
    public void setLeg(String leg) { this.leg = leg; }
}



