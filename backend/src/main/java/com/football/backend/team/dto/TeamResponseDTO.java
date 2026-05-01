package com.football.backend.team.dto;

import com.football.backend.team.model.Team;

public class TeamResponseDTO {
    private Long id;
    private String nameTeam;
    private int foundedYear;
    private String logoUrl;

    public TeamResponseDTO(Team team) {
        this.id = team.getId();
        this.nameTeam = team.getNameTeam();
        this.foundedYear = team.getFoundedYear();
        this.logoUrl = team.getLogoUrl();
    }

    public Long getId() { return id; }
    public String getNameTeam() { return nameTeam; }
    public int getFoundedYear() { return foundedYear; }
    public String getLogoUrl() { return logoUrl; }
}
