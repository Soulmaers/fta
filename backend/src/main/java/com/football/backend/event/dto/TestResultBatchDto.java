package com.football.backend.event.dto;




public class TestResultBatchDto {

    private Long playerId;
    private Double value;


    public TestResultBatchDto(){}


    public void setPlayerId(Long playerId){this.playerId=playerId;}
    public void setValue(Double value){this.value=value;}


    public Long getPlayerId(){return playerId;}
    public Double getValue(){return value;}
}
