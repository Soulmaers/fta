package com.football.backend.lineup.repository;

import com.football.backend.lineup.model.Lineup;
import com.football.backend.team.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface LineupRepository extends JpaRepository<Lineup, Long>{


    List<Lineup> findAllByManagerIdAndVisibleTrue(Long userId);
    List<Lineup> findAllByManagerId(Long managerId);
    long countByManagerIdAndVisibleTrue(Long userId);
    Optional<Lineup> findByIdAndVisibleTrue(Long id);
}
