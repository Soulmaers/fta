package com.football.backend.coach.repository;
import com.football.backend.auth.model.User;
import com.football.backend.team.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import com.football.backend.coach.model.Coach;

import java.util.List;
import java.util.Optional;

public interface CoachRepository extends JpaRepository<Coach, Long>{

    boolean existsByUserLogin(String login);

    Optional<Coach> findByUserLogin(String login);
    Optional<Coach> findByUser(User user);
    Optional<Coach> findByUserId(Long userId);
    List<Coach> findAllByManagerIdAndVisibleTrue(Long managerId);
    List<Coach> findAllByTeam_Id(Long teamId);

}
