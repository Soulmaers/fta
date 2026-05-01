package com.football.backend.team.service;


import com.football.backend.auth.model.User;
import com.football.backend.auth.repository.UserRepository;
import com.football.backend.common.error.UserNotFoundException;
import com.football.backend.team.dto.RequestTeamDTO;
import com.football.backend.team.dto.TeamResponseDTO;
import com.football.backend.team.dto.UpdateTeamRequestDTO;
import com.football.backend.team.model.Team;
import com.football.backend.team.repository.TeamRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.football.backend.player.model.Player;
import com.football.backend.player.repository.PlayerRepository;
import java.util.Collections;

@Service
public class TeamService {
   private final TeamRepository teams;
    private final UserRepository users;
    private final PlayerRepository players;


    public TeamService(TeamRepository teams, UserRepository users, PlayerRepository players){
        this.teams=teams;
        this.users=users;
        this.players=players;
    }


    public TeamResponseDTO createTeam(Long userId, RequestTeamDTO req){

        User user = users.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));

        Team team= new Team(user);
     team.setNameTeam(req.getNameTeam());
        team.setFoundedYear(req.getFoundedYear());
     team.setLogoUrl(req.getLogoUrl());
     Team saved=teams.save(team);

     return new TeamResponseDTO(saved);
         }

    public TeamResponseDTO updateTeam(Long teamId, UpdateTeamRequestDTO req){

        Team team = teams.findById(teamId)
                .orElseThrow(() -> new UserNotFoundException("Команда не найдена"));

               team.setNameTeam(req.getNameTeam());
        team.setFoundedYear(req.getFoundedYear());
        team.setLogoUrl(req.getLogoUrl());
        Team saved=teams.save(team);

        return new TeamResponseDTO(saved);
    }


    @Transactional(readOnly = true)
    public List<TeamResponseDTO> getTeams(Long userId) {
        User user = users.findById(userId).orElseThrow();
        if ("PLAYER".equals(user.getRole().name())) {
            return players.findByUserId(userId)
                    .map(Player::getTeam)
                    .filter(team -> team != null && team.getVisible())
                    .map(team -> List.of(new TeamResponseDTO(team)))
                    .orElse(Collections.emptyList());
        }

        return teams.findAllByUserIdAndVisibleTrue(userId)
                .stream()
                .map(TeamResponseDTO::new)
                .toList();
    }
    public void deleteTeam(Long teamId, Long userId){

        Team team = teams.findById(teamId)
                .orElseThrow(() -> new UserNotFoundException("Команда не найдена"));


        if (!team.getUser().getId().equals(userId)) {
            throw new RuntimeException("Нет доступа");
        }
        team.setVisible(false);
        teams.save(team);

    }



}
