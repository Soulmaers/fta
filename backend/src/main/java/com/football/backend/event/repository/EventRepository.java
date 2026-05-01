package com.football.backend.event.repository;

import com.football.backend.event.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByManagerId(Long managerId);
    List<Event> findAllBySquads_Id(Long lineupId);
    List<Event> findAllByTeam_Id(Long teamId);
    List<Event> findByGroupId(String groupId);

    @Query("SELECT DISTINCT e FROM Event e LEFT JOIN e.squads s WHERE e.team.id = :teamId AND (e.squads IS EMPTY OR s.id = :lineupId)")
    List<Event> findAllForPlayer(@Param("teamId") Long teamId, @Param("lineupId") Long lineupId);
}
