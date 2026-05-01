package com.football.backend.player.dto;

import com.football.backend.coach.model.Coach;
import com.football.backend.player.model.Player;

public class CreateResponsePlayerDTO {

    private String login;
       private Player player;


    public CreateResponsePlayerDTO(Player player, String login) {
        this.player = player;
        this.login=login;
         }
    public String getLogin() {
        return login;
    }


    public Player getPlayer() {
        return player;
    }
}
