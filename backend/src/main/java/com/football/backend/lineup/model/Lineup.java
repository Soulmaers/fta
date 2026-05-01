package com.football.backend.lineup.model;


import com.football.backend.auth.model.User;
import jakarta.persistence.*;

@Entity
@Table(name="lineups")
public class Lineup {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="manager_id",nullable=false)
    private User manager;

    @Column
    private String lineupName;

    @Column(nullable=false)
    private boolean visible=true;
    protected Lineup(){

    }


    public Lineup(User user){
        this.manager=user;
    }

    public boolean getVisible() { return visible; }
    public Long getId() { return id; }
    public String getLineupName(){
        return lineupName;
    }

    public void setLineupName(String lineupName){
        this.lineupName=lineupName;
    }
    public void setVisible(boolean visible){
        this.visible=visible;
    }
    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }
}
