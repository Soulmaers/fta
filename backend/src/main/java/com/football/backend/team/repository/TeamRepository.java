package com.football.backend.team.repository;
import com.football.backend.auth.model.User;
import com.football.backend.player.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import com.football.backend.team.model.Team;

import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {


    List<Team> findAllByUserIdAndVisibleTrue(Long userId);

    Optional<Team> findByIdAndVisibleTrue(Long id);
}
