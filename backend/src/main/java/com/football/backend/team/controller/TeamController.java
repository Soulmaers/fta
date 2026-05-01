package com.football.backend.team.controller;


import com.football.backend.team.dto.RequestTeamDTO;

import com.football.backend.team.dto.TeamResponseDTO;
import com.football.backend.team.dto.UpdateTeamRequestDTO;
import com.football.backend.team.service.TeamService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;


    public  TeamController(TeamService teamService){
        this.teamService=teamService;

    }

    @PostMapping("/create/{userId}")
    public TeamResponseDTO createTeam(@PathVariable("userId") Long userId, @RequestBody RequestTeamDTO req){
               TeamResponseDTO team=teamService.createTeam(userId, req);

        return team;
    }
    @GetMapping("/{userId}")
    public List<TeamResponseDTO> getTeams(@PathVariable("userId") Long userId){
        System.out.println(userId);
        return teamService.getTeams(userId);
    }

    @PutMapping("/{teamId}")
    public TeamResponseDTO updateTeam(@PathVariable("teamId") Long teamId,@RequestBody UpdateTeamRequestDTO req){

        return teamService.updateTeam(teamId, req);


    }
    @DeleteMapping("/{teamId}")
    public void deleteTeam( @PathVariable Long teamId,
                                       @RequestParam Long userId){

         teamService.deleteTeam(teamId,userId);


    }



}
