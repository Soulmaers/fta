package com.football.backend.player.dto;

import java.util.List;

public class TeamAssignmentRequestDto {
    private Long teamId;
    private List<PlayerAssignmentDto> assignments;

    public TeamAssignmentRequestDto() {}

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public List<PlayerAssignmentDto> getAssignments() { return assignments; }
    public void setAssignments(List<PlayerAssignmentDto> assignments) { this.assignments = assignments; }
}
