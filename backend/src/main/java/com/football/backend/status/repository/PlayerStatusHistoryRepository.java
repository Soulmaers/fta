package com.football.backend.status.repository;

import com.football.backend.player.model.Player;
import com.football.backend.status.model.PlayerStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PlayerStatusHistoryRepository extends JpaRepository<PlayerStatusHistory, Long> {

List<PlayerStatusHistory> findAllByPlayerIdOrderByChangeTimeDesc(Long playerId);

Optional<PlayerStatusHistory> findTopByPlayerIdAndChangeTimeLessThanEqualOrderByChangeTimeDesc(
        Long playerId,
        LocalDateTime dateTime
);

}
