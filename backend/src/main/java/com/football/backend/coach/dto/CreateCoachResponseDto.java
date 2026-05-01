package com.football.backend.coach.dto;


import com.football.backend.coach.model.Coach;

public class CreateCoachResponseDto {
  private String login;
    private Coach coach;


    public CreateCoachResponseDto(Coach coach, String login) {
        this.coach = coach;
        this.login=login;
    }
    public String getLogin() {
        return login;
    }

    public Coach getCoach() {
        return coach;
    }
}
