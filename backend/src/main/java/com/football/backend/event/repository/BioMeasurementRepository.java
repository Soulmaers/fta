package com.football.backend.event.repository;

import com.football.backend.event.model.BioMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BioMeasurementRepository extends JpaRepository<BioMeasurement, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT b FROM BioMeasurement b JOIN b.event e WHERE b.player.id = :playerId ORDER BY e.date DESC, e.startTime DESC")
    List<BioMeasurement> findAllByPlayerIdOrderByEventDateDesc(Long playerId);

    Optional<BioMeasurement> findFirstByEventIdAndPlayerId(Long eventId, Long playerId);
    
    boolean existsByEventIdAndPlayerId(Long eventId, Long playerId);
    
    List<BioMeasurement> findAllByEventId(Long eventId);

    void deleteByEventId(Long eventId);
}
