package com.football.backend.status.dto;

import com.football.backend.player.model.PlayerStatus;

public class StatusUpdateRequest {

    private PlayerStatus status;

  public StatusUpdateRequest(){}



    public void setStatus(PlayerStatus status){ this.status=status;}
    public PlayerStatus getStatus(){return status;}
}
