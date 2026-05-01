package com.football.backend.event.repository;

import com.football.backend.event.model.TestResult;
import com.football.backend.event.model.TestType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {

    List<TestResult> findByEvent_Id(Long eventId);
    Optional<TestResult> findByEvent_IdAndPlayer_IdAndTestType(Long eventId, Long playerId, TestType testType);
    List<TestResult> findByEvent_IdAndTestType(Long eventId, TestType testType);

    boolean existsByEvent_Id(Long eventId);
    boolean existsByEvent_IdAndTestType(Long eventId, TestType testType);
    boolean existsByEvent_IdAndPlayer_IdAndTestType(Long eventId, Long playerId, TestType testType);

    void deleteByEvent_Id(Long eventId);
}
