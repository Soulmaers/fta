package com.football.backend.event.model;


import com.football.backend.player.model.Player;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="test_results")
public class TestResult {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name="player_id")
        private Player player;

    @ManyToOne
    @JoinColumn(name="event_id")
    private Event event;


    @Enumerated(EnumType.STRING)
    @Column
    private TestType testType;

    @Column
    private Double testValue;
    @Column
    private LocalDateTime recordedAt;


    public TestResult(){}


    public void setId(Long id){this.id=id;}
    public void setPlayer(Player player){this.player=player;}
    public void setRecordedAt(LocalDateTime recordedAt){this.recordedAt=recordedAt;}
    public void setTestValue(Double testValue){this.testValue=testValue;}
    public void setTestType(TestType testType){this.testType=testType;}
    public void setEvent(Event event){this.event=event;}

    public Long getId(){return id;}
    public Player getPlayer(){return player;}
    public Event getEvent(){return event;}
    public TestType getTestType(){return testType;}
    public Double getTestValue(){return testValue;}
    public LocalDateTime getRecordedAt(){return recordedAt;}
}
