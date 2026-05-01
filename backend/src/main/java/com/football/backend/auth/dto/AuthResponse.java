package com.football.backend.auth.dto;

import com.football.backend.auth.model.Role;
import com.football.backend.coach.dto.CoachSummaryDto;
import com.football.backend.player.dto.PlayerSummaryDto;

public class AuthResponse {
    private String accessToken;
    private String login;
    private Role role;
    private Long id;
    private boolean activated;
    private CoachSummaryDto coach;
    private PlayerSummaryDto player;

    public AuthResponse(String accessToken,String login, Long id,Role role, boolean activated,CoachSummaryDto coach,
                        PlayerSummaryDto player        ){
        this.login=login;
        this.role=role;
        this.id=id;
        this.activated=activated;
        this.coach=coach;
        this.player=player;
        this.accessToken=accessToken;
    }



    public String getLogin(){
        return login;
    }
    public Role getRole(){
        return role;
    }
    public Long getId(){
        return id;
    }
    public boolean isActivated(){
        return activated;
    }
    public CoachSummaryDto getCoach(){
        return coach;
    }
    public PlayerSummaryDto getPlayer(){
        return player;
    }
    public String getAccessToken(){
        return accessToken;
    }

}
