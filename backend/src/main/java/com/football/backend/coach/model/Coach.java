package com.football.backend.coach.model;
import com.football.backend.team.model.Team;
import jakarta.persistence.*;
import com.football.backend.auth.model.User;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import java.time.LocalDate;


@Entity
@Table (name="coaches")

public class Coach {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;



    @OneToOne(optional=false)
    @JoinColumn(name="user_id",unique=true)
       private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = true)
    private User manager;


    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id") // nullable по умолчанию true, но можно явно
    private Team team;

    @Column
        private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CoachProfileType profilType;

    @Column
        private String profession;

    @Column
        private LocalDate birthDate;

    @Column
        private String photoUrl;

    @Column(nullable=false)
    private boolean visible=true;

     protected Coach(){

    }

    public Coach(User user, CoachProfileType profilType,User manager) {
        this.user = user;
        this.profilType = profilType;
        this.manager = manager;
    }


    public void setTeam(Team team) { this.team = team; }
    public Team getTeam() { return team; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public CoachProfileType getProfilType() { return profilType; }

    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public Long getId() { return id; }
    public User getUser() { return user; }

    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }


    public boolean getVisible() { return visible; }
    public void setVisible(boolean visible){
        this.visible=visible;
    }
}
