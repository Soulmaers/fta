package com.football.backend.team.model;


import com.football.backend.auth.model.User;
import jakarta.persistence.*;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;


@Entity
@Table (name="teams")
public class Team {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name="manager_id",nullable=false)
    private User user;

    @Column(nullable=false)
    private String nameTeam;
    @Column(nullable=false)
    private int foundedYear;
    private String logoUrl;
    @Column(nullable=false)
private boolean visible=true;
    protected Team(){

    }

    public Team(User user){
        this.user=user;
    }


    public void setNameTeam(String nameTeam){
        this.nameTeam=nameTeam;
    }
    public void setFoundedYear(int foundedYear){
        this.foundedYear=foundedYear;
    }
    public void setLogoUrl(String logoUrl){
        this.logoUrl=logoUrl;
    }
    public void setVisible(boolean visible){
        this.visible=visible;
    }
    public String getNameTeam(){
        return nameTeam;
    }

    public int getFoundedYear(){
        return foundedYear;
    }
    public String getLogoUrl(){
        return logoUrl;
    }
    public boolean getVisible() { return visible; }
    public Long getId() { return id; }
    public User getUser(){
        return user;
    }
}
