package com.football.backend.event.repository;

import com.football.backend.event.model.TrainingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingEventRepository extends JpaRepository<TrainingEvent, Long> {
}
