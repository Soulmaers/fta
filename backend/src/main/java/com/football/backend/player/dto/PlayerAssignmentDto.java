package com.football.backend.player.dto;

public class PlayerAssignmentDto {
    private Long playerId;
    private Long lineupId;

    public PlayerAssignmentDto() {}

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }

    public Long getLineupId() { return lineupId; }
    public void setLineupId(Long lineupId) { this.lineupId = lineupId; }
}
