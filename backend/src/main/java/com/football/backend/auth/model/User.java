package com.football.backend.auth.model;
import jakarta.persistence.*;

import com.football.backend.auth.model.Role;


@Entity
@Table(name="users")

public class User{


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true)
    private String login;

    @Column(nullable=false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Role role;

    @Column
    private boolean activated;

    protected User() {
    }

    public User(String login, String passwordHash, Role role){
this.login=login;
this.passwordHash=passwordHash;
this.role=role;

    }


    public Long getId(){
        return id;
    }
    public String getLogin(){
        return login;
    }
    public Role getRole(){
        return role;
    }
    public boolean isActivated(){
        return activated;
    }


    public void setPasswordHash(String passwordHash){
        this.passwordHash=passwordHash;
    }
public void setActivated(boolean activated) { this.activated=activated;}
    public String getPasswordHash(){
        return passwordHash;
    }
}
