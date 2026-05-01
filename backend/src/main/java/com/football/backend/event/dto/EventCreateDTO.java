package com.football.backend.event.dto;


import com.football.backend.event.model.EventType;
import com.football.backend.event.model.TestType;
import com.football.backend.event.model.TrainingSubtype;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class EventCreateDTO {

    private EventType type;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;
    private String location;
    private List<Long> lineupIds;
    private TrainingDetailsDTO trainingDetails;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate repeatUntil;
    private List<DayOfWeek> daysOfWeek;
    private Long managerId;
    private Long teamId;


    public EventCreateDTO(){};

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public void setType(EventType type){this.type=type;}
public void setDate(LocalDate date){this.date=date;}
    public void setRepeatUntil(LocalDate repeatUntil){this.repeatUntil=repeatUntil;}
    public void setStartTime(LocalTime startTime){this.startTime=startTime;}
    public void setEndTime(LocalTime endTime){this.endTime=endTime;}
    public void setLocation (String location){this.location=location;}
    public void setLineupIds(List<Long> lineupIds){this.lineupIds=lineupIds;}
    public void setDaysOfWeek(List<DayOfWeek> daysOfWeek){this.daysOfWeek=daysOfWeek;}
public void setTrainingDetails(TrainingDetailsDTO trainingDetails){this.trainingDetails=trainingDetails;}

    public EventType getType(){ return type;}
    public LocalDate getDate(){ return date;}
    public LocalDate getRepeatUntil(){ return repeatUntil;}
    public LocalTime getStartTime(){ return startTime;}
    public LocalTime getEndTime(){ return endTime;}
    public String getLocation(){ return location;}
    public List<Long> getLineupIds(){ return lineupIds;}
    public List<DayOfWeek> getDaysOfWeek(){ return daysOfWeek;}
    public TrainingDetailsDTO getTrainingDetails(){return trainingDetails;}
}
