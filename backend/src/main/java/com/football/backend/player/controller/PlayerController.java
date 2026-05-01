package com.football.backend.player.controller;


import com.football.backend.coach.dto.CoachSummaryDto;
import com.football.backend.coach.dto.RequestCoachDTO;
import com.football.backend.player.dto.CreateRequestPlayerDTO;
import com.football.backend.player.dto.CreateResponsePlayerDTO;
import com.football.backend.player.dto.PlayerSummaryDto;
import com.football.backend.player.dto.TeamAssignmentRequestDto;
import org.springframework.web.bind.annotation.*;
import com.football.backend.player.service.PlayerService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @PostMapping("/create/{userId}")
    public PlayerSummaryDto createPlayer(@PathVariable("userId") Long userId,
                                                @RequestBody CreateRequestPlayerDTO req){
        return playerService.createPlayer(userId, req);
    }

    @GetMapping("/{userId}")
    public List<PlayerSummaryDto> getPlayers(@PathVariable("userId") Long userId){
              return playerService.getPlayers(userId);
    }
    @DeleteMapping("/{playerId}")
    public void deletePlayer( @PathVariable Long playerId,
                             @RequestParam Long userId){

        playerService.deletePlayer(playerId,userId);
    }

    @PutMapping("/{playerId}")
    public PlayerSummaryDto updatePlayer(@PathVariable("playerId") Long playerId,@RequestBody CreateRequestPlayerDTO req){

        return playerService.updatePlayer(playerId, req);


    }

    @PostMapping("/sync-assignments/{userId}")
    public List<PlayerSummaryDto> syncTeamAssignments(@PathVariable("userId") Long userId,
                                                      @RequestBody TeamAssignmentRequestDto req) {
        return playerService.syncTeamAssignments(userId, req);
    }

    @GetMapping("/profile/{userId}")
    public PlayerSummaryDto getPlayerProperty(@PathVariable("userId")
    Long userId){
        return playerService.getPlayerProperty(userId);
    }

    @GetMapping("/profile/{userId}/status-at")
    public Map<String, String> getPlayerStatusAtDate(
            @PathVariable("userId") Long userId,
            @RequestParam("date") LocalDate date
    ) {
        String status = playerService.getPlayerStatusAtDate(userId, date);
        return Map.of("status", status);
    }
}


