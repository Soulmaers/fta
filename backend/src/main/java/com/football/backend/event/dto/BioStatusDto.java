package com.football.backend.event.dto;

public class BioStatusDto {
    private Long playerId;
    private Boolean hasBio;

    public BioStatusDto() {}

    public BioStatusDto(Long playerId, Boolean hasBio) {
        this.playerId = playerId;
        this.hasBio = hasBio;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public Boolean getHasBio() {
        return hasBio;
    }

    public void setHasBio(Boolean hasBio) {
        this.hasBio = hasBio;
    }
}

