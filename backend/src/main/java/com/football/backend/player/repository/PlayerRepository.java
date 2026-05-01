package com.football.backend.player.repository;
import com.football.backend.auth.model.User;
import com.football.backend.coach.model.Coach;
import org.springframework.data.jpa.repository.JpaRepository;
import com.football.backend.player.model.Player;

import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long>{

    boolean existsByUserLogin(String login);

    Optional<Player> findByUserLogin(String login);
    Optional<Player> findByUser(User user);
    Optional<Player> findByUserId(Long userId);
    List<Player> findAllByManagerIdAndVisibleTrue(Long managerId);
    List<Player> findAllByTeam_Id(Long teamId);
    List<Player> findAllByLineup_Id(Long lineupId);
}


