package com.football.backend.event.repository;

import com.football.backend.event.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findFirstByEventIdAndPlayerId(Long eventId, Long playerId);
    
    List<Attendance> findByEventId(Long eventId);

    boolean existsByEventId(Long eventId);
    boolean existsByEventIdAndPlayerId(Long eventId, Long playerId);

    void deleteByEventId(Long eventId);
}
