package com.football.backend.coach.controller;


//import com.football.backend.coach.service.CoachService;
import com.football.backend.coach.dto.CoachSummaryDto;
import com.football.backend.coach.dto.RequestCoachDTO;
import com.football.backend.coach.dto.TeamCoachAssignmentRequestDto;
import com.football.backend.coach.service.CoachService;
import com.football.backend.player.dto.PlayerSummaryDto;
import com.football.backend.team.dto.TeamResponseDTO;
import com.football.backend.team.dto.UpdateTeamRequestDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coaches")
public class CoachController {


    private final CoachService coachService;


    public CoachController(CoachService coachService){
        this.coachService=coachService;
    }

    @PostMapping("/create/{userId}")
    public CoachSummaryDto createCoach(@PathVariable("userId") Long userId,
                                              @RequestBody RequestCoachDTO req){
               CoachSummaryDto coach= coachService.createCoach(userId, req);
        System.out.println(coach);
        return coach;
    }
    @GetMapping("/{userId}")
    public List<CoachSummaryDto> getTeams(@PathVariable("userId") Long userId){
        System.out.println(userId);
          return coachService.getCoaches(userId);
    }
    @PutMapping("/{coachId}")
    public CoachSummaryDto updateCoach(@PathVariable("coachId") Long coachId,@RequestBody RequestCoachDTO req){

        return coachService.updateCoach(coachId, req);


    }
    @DeleteMapping("/{coachId}")
    public void deleteCoach( @PathVariable Long coachId,
                             @RequestParam Long userId){

        coachService.deleteCoach(coachId,userId);
    }

    @PostMapping("/sync-assignments/{userId}")
    public List<CoachSummaryDto> syncTeamAssignments(@PathVariable("userId") Long userId,
                                                     @RequestBody TeamCoachAssignmentRequestDto req) {
        return coachService.syncTeamAssignments(userId, req);
    }

    @GetMapping("/profile/{userId}")
    public CoachSummaryDto getCoachProperty(@PathVariable("userId")
                                              Long userId){
        return coachService.getCoachProperty(userId);
    }

}
