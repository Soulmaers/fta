package com.football.backend.event.dto;

import com.football.backend.event.model.AttendanceStatus;

public class AttendanceBatchDto {

    private Long playerId;
    private AttendanceStatus status;

    public AttendanceBatchDto(){}

    public void setPlayerId(Long playerId){this.playerId=playerId;}
    public void setStatus(AttendanceStatus status){this.status=status;}

    public Long getPlayerId(){ return playerId;}
    public AttendanceStatus getStatus(){ return status;}
}
