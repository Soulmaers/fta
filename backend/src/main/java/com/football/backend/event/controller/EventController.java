package com.football.backend.event.controller;

import com.football.backend.event.dto.EventCreateDTO;
import com.football.backend.event.dto.BioStatusDto;
import com.football.backend.event.dto.TestResultBatchDto;
import com.football.backend.event.model.Event;
import com.football.backend.event.model.TestResult;
import com.football.backend.event.model.TestType;
import com.football.backend.event.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity createEvents(@RequestBody EventCreateDTO req) {
        System.out.println(req);
        eventService.createEvent(req);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Event>> getEvents(@PathVariable Long userId) {
        return ResponseEntity.ok(eventService.getAllEventsForUser(userId));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<Void> updateEvent(@PathVariable Long eventId, 
                                            @RequestBody EventCreateDTO dto,
                                            @RequestParam(required = false, defaultValue = "SINGLE") String scope) {
        eventService.updateEvent(eventId, dto, scope);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{eventId}/attendance")
    public ResponseEntity<Void> saveAttendance(
            @PathVariable Long eventId,
            @RequestBody List<com.football.backend.event.dto.AttendanceBatchDto> dtos) {
        eventService.saveAttendanceBatch(eventId, dtos);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{eventId}/attendance")
    public ResponseEntity<List<com.football.backend.event.dto.AttendanceBatchDto>> getAttendance(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getAttendanceForEvent(eventId));
    }

    @PostMapping("/{eventId}/rpe")
    public ResponseEntity<Void> savePlayerRpe(
            @PathVariable Long eventId,
            @RequestParam Long playerId,
            @RequestBody com.football.backend.event.dto.RpeSubmitDto dto) {
        eventService.savePlayerRpe(eventId, playerId, dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{eventId}/bio")
    public ResponseEntity<String> savePlayerBio(
            @PathVariable Long eventId,
            @RequestParam Long playerId,
            @RequestBody com.football.backend.event.dto.BioSubmitDto dto) {
        String metricsJson = eventService.savePlayerBio(eventId, playerId, dto);
        if (metricsJson != null) {
            return ResponseEntity.ok(metricsJson);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{eventId}/bio")
    public ResponseEntity<com.football.backend.event.model.BioMeasurement> getPlayerBio(
            @PathVariable Long eventId,
            @RequestParam Long playerId) {
        return ResponseEntity.ok(eventService.getBioMeasurementForEvent(eventId, playerId));
    }

    @GetMapping("/{eventId}/bio/status")
    public ResponseEntity<List<BioStatusDto>> getBioStatus(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getBioStatusForEvent(eventId));
    }

    @GetMapping("/{eventId}/rpe")
    public ResponseEntity<com.football.backend.event.dto.RpeSubmitDto> getPlayerRpe(
            @PathVariable Long eventId,
            @RequestParam Long playerId) {
        Integer rpe = eventService.getRpeValueForEvent(eventId, playerId);
        if (rpe == null) return ResponseEntity.noContent().build();
        com.football.backend.event.dto.RpeSubmitDto dto = new com.football.backend.event.dto.RpeSubmitDto();
        dto.setRpeValue(rpe);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/bio/last/{userId}")
    @ResponseBody
    public com.football.backend.event.model.BioMeasurement getLastBio(@PathVariable Long userId) {
        return eventService.getLastBioMeasurement(userId);
    }

    @PostMapping("/{eventId}/tests/{testType}")
    public ResponseEntity<Void> saveTestResults(@PathVariable Long eventId,
                                                @PathVariable TestType testType,
                                                @RequestBody List<TestResultBatchDto> dtos){
        eventService.saveTestResultsBatch(eventId, testType, dtos);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{eventId}/tests")
    public ResponseEntity<List<TestResult>> getTestResults(@PathVariable Long eventId){
        return ResponseEntity.ok(eventService.getTestResultsForEvent(eventId));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId, 
                                            @RequestParam(required = false, defaultValue = "SINGLE") String scope) {
        eventService.deleteEvent(eventId, scope);
        return ResponseEntity.ok().build();
    }
}
