package com.football.backend.coach.dto;

import java.util.List;

public class TeamCoachAssignmentRequestDto {
    private Long teamId;
    private List<Long> coachIds;

    public TeamCoachAssignmentRequestDto() {}

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public List<Long> getCoachIds() { return coachIds; }
    public void setCoachIds(List<Long> coachIds) { this.coachIds = coachIds; }
}
