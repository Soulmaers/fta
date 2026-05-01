package com.football.backend.lineup.service;


import com.football.backend.auth.model.User;
import com.football.backend.auth.repository.UserRepository;
import com.football.backend.common.error.UserNotFoundException;
import com.football.backend.lineup.dto.RequestLineupDTO;
import com.football.backend.lineup.dto.ResponseLineupDTO;
import com.football.backend.lineup.model.Lineup;
import com.football.backend.lineup.repository.LineupRepository;
import com.football.backend.team.dto.TeamResponseDTO;
import com.football.backend.team.model.Team;
import com.football.backend.player.model.Player;
import com.football.backend.player.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LineupService {

    private final LineupRepository lineups;
    private final UserRepository users;
    private final PlayerRepository players;

    public LineupService(LineupRepository lineups, UserRepository users, PlayerRepository players) {
        this.lineups = lineups;
        this.users = users;
        this.players = players;
    }


    public ResponseLineupDTO createLineup(Long userId, RequestLineupDTO req) {
        User user = users.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));

        long count = lineups.countByManagerIdAndVisibleTrue(userId);
        if (count >= 2) {
            throw new RuntimeException("Можно создать максимум 2 состава");
        }

        Lineup lineup = new Lineup(user);
        lineup.setLineupName(req.getLineupName());

        Lineup saved = lineups.save(lineup);
        return new ResponseLineupDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ResponseLineupDTO> getLineup(Long userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));

        Long managerId = userId;
        if (user.getRole() == com.football.backend.auth.model.Role.PLAYER) {
            managerId = players.findByUserId(userId)
                    .map(p -> p.getManager().getId())
                    .orElse(userId);
        }

        return lineups.findAllByManagerIdAndVisibleTrue(managerId)
                .stream()
                .map(ResponseLineupDTO::new)
                .toList();
    }

    @Transactional
    public void deleteLineup(Long lineupId, Long userId) {
        Lineup lineup = lineups.findById(lineupId)
                .orElseThrow(() -> new UserNotFoundException("Состав не найден"));

        if (!lineup.getManager().getId().equals(userId)) {
            throw new RuntimeException("Нет доступа");
        }

        // 1. Surgical cleanup: notify players they no longer have this lineup
        List<Player> playersInLineup = players.findAllByLineup_Id(lineupId);
        for (Player p : playersInLineup) {
            p.setLineup(null);
            // We keep the team reference! The player stays in the team, just loses the tactial spot.
        }
        players.saveAll(playersInLineup);

        // 2. Soft delete the lineup
        lineup.setVisible(false);
        lineups.save(lineup);
    }

    @Transactional
    public ResponseLineupDTO updateLineup(Long lineupId, RequestLineupDTO req) {
        Lineup lineup = lineups.findById(lineupId)
                .orElseThrow(() -> new RuntimeException("Состав не найден"));
        
        lineup.setLineupName(req.getLineupName());
        Lineup saved = lineups.save(lineup);
        return new ResponseLineupDTO(saved);
    }

}
