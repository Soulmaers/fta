package com.football.backend.player.model;
import com.football.backend.coach.model.CoachProfileType;
import com.football.backend.lineup.model.Lineup;
import com.football.backend.team.model.Team;
import jakarta.persistence.*;
import com.football.backend.auth.model.User;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import java.time.LocalDate;


@Entity
@Table (name="players")

public class Player {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;



    @OneToOne(optional=false)
    @JoinColumn(name="user_id",unique=true)
    private User user;

    @ManyToOne(optional=true)
    @JoinColumn(name="team_id",nullable = true)
    private Team team;

    @ManyToOne(optional=false)
    @JoinColumn(name="manager_id",nullable = true)
    private User manager;

     @ManyToOne(optional=true)
    @JoinColumn(name="lineup_id",nullable = true)
    private Lineup lineup;


    @Column
    private String fullName;

    @Column
    private String position;

    @Column
    private Integer weight;
    @Column
    private Integer height;
    @Column
    private Integer number;

    @Column
    private String leg;

    @Enumerated(EnumType.STRING)
    @Column
    private PlayerStatus status;
    @Enumerated(EnumType.STRING)
    @Column
    private PlayerGameStatus statusGame;
    @Column
    private LocalDate birthDate;

    @Column
    private String photoUrl;

    @Column(name = "father_height")
    private Integer fatherHeight;

    @Column(name = "mother_height")
    private Integer motherHeight;

    @Column(nullable=false)
    private boolean visible=true;
    protected Player(){

    }

    /*public Player(User user,Team team,Lineup lineup,PlayerStatus status,
    PlayerGameStatus statusGame){
        this.team=team;
                this.user=user;
                  this.lineup=lineup;
        this.status = PlayerStatus.READY;
        this.statusGame = PlayerGameStatus.UNDEFINED;
    }*/

    public Player(User user, PlayerStatus status, PlayerGameStatus statusGame, User manager) {
        this.user = user;
        this.status = status;
        this.statusGame = statusGame;
        this.manager = manager;
    }



    public void setFullName(String fullName){
        this.fullName=fullName;
    }
    public void setWeight(Integer weight){
        this.weight=weight;
    }
    public void setHeight(Integer height){
        this.height=height;
    }
    public void setNumber(Integer number){
        this.number=number;
    }
    public void setLeg(String leg){
        this.leg=leg;
    }
    public void setPosition(String position){
        this.position=position;
    }
    public void setBirthDate(LocalDate birthDate){
        this.birthDate=birthDate;
    }
    public void setPhotoUrl(String photoUrl){
        this.photoUrl=photoUrl;
    }
public void setLineup(Lineup lineup) {
    this.lineup = lineup;
}
public void setTeam(Team team) {
    this.team = team;
}
    public PlayerStatus getStatus() { return status; }
    public PlayerGameStatus getStatusGame() { return statusGame; }

    public String getFullName(){
        return fullName;
    }
    public String getPosition(){
        return position;
    }
    public Integer getWeight(){
        return weight;
    }
    public Integer getHeight(){
        return height;
    }
    public Integer getNumber(){
        return number;
    }
    public String getLeg(){
        return leg;
    }
    public String getPhotoUrl(){
        return photoUrl;
    }
    public LocalDate getBirthDate(){
        return birthDate;
    }
    public Long getId(){
        return id;
    }
    public Team getTeam(){
        return team;
    }
       public Lineup getLineup(){
        return lineup;
    }
    public User getUser(){
        return user;
    }

    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }
    public void setStatus(PlayerStatus status) { this.status=status; }
    public boolean getVisible() { return visible; }
    public void setVisible(boolean visible){
        this.visible=visible;
    }

    public Integer getFatherHeight() { return fatherHeight; }
    public void setFatherHeight(Integer fatherHeight) { this.fatherHeight = fatherHeight; }
    public Integer getMotherHeight() { return motherHeight; }
    public void setMotherHeight(Integer motherHeight) { this.motherHeight = motherHeight; }
}
