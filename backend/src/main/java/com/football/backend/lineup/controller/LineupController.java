package com.football.backend.lineup.controller;


import com.football.backend.lineup.dto.RequestLineupDTO;
import com.football.backend.lineup.dto.ResponseLineupDTO;
import com.football.backend.lineup.service.LineupService;
import com.football.backend.team.dto.TeamResponseDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lineups")
public class LineupController {
private final LineupService lineupService;

    public  LineupController(LineupService lineupService){
        this.lineupService=lineupService;

    }

    @PostMapping("/create/{userId}")
    public ResponseLineupDTO createLineup(@PathVariable("userId") Long userId, @RequestBody RequestLineupDTO req){
        ResponseLineupDTO lineup=lineupService.createLineup(userId, req);

        return lineup;
    }

    @GetMapping("/{userId}")
    public List<ResponseLineupDTO> getLineups(@PathVariable("userId") Long userId){
        System.out.println(userId);
        return lineupService.getLineup(userId);
    }

    @DeleteMapping("/{lineupId}")
    public void deleteTeam( @PathVariable Long lineupId,
                            @RequestParam Long userId){

        lineupService.deleteLineup(lineupId,userId);
    }

    @PutMapping("/{lineupId}")
    public ResponseLineupDTO updateLineup(@PathVariable Long lineupId, @RequestBody RequestLineupDTO req){
        return lineupService.updateLineup(lineupId, req);
    }
}
