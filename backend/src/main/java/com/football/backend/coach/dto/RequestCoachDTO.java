package com.football.backend.coach.dto;

import java.time.LocalDate;

public class RequestCoachDTO {

    private String fullName;
    private String profession;
    private LocalDate birthDate;
    private String photoUrl;
private String login;
    public RequestCoachDTO() {}

    public String getFullName() { return fullName; }
    public String getProfession() { return profession; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getPhotoUrl() { return photoUrl; }

    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setProfession(String profession) { this.profession = profession; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
