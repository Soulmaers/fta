package com.football.backend.status.controller;


import com.football.backend.player.dto.PlayerSummaryDto;
import com.football.backend.player.service.PlayerService;
import com.football.backend.status.dto.StatusUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/players/profile")
public class PlayerHistoryStatusController {
    private final PlayerService playerService;

public PlayerHistoryStatusController(PlayerService playerService){
    this.playerService=playerService;
}

    @PutMapping("/{userId}")

    public PlayerSummaryDto updatePlayerStatus( @PathVariable("userId") Long userId,  @RequestBody StatusUpdateRequest req){

    return playerService.updatePlayerStatus(userId, req.getStatus());
    }





}
