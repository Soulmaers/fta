package com.football.backend.event.service;

import com.football.backend.event.dto.*;
import com.football.backend.event.model.*;
import com.football.backend.event.repository.*;
import com.football.backend.auth.model.User;
import com.football.backend.auth.model.Role;
import com.football.backend.auth.repository.UserRepository;
import com.football.backend.player.model.PlayerStatus;
import com.football.backend.team.model.Team;
import com.football.backend.team.repository.TeamRepository;
import com.football.backend.lineup.model.Lineup;
import com.football.backend.lineup.repository.LineupRepository;
import com.football.backend.player.model.Player;
import com.football.backend.player.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired private EventRepository events;
    @Autowired private TrainingEventRepository trainingEvents;
    @Autowired private AttendanceRepository attendance;
    @Autowired private UserRepository users;
    @Autowired private TeamRepository teams;
    @Autowired private LineupRepository lineups;
    @Autowired private PlayerRepository players;
    @Autowired private TestResultRepository testResultRepository;
    @Autowired private BioMeasurementRepository bioMeasurements;
    @Autowired private AtlasIntegrationService atlasIntegrationService;

    public List<Event> getAllEvents() {
        return events.findAll();
    }

    public List<Event> getEventsForManager(Long managerId) {
        return events.findAllByManagerId(managerId);
    }

    public List<Event> getEventsForPlayer(Long userId) {
        Player player = players.findByUserId(userId).orElse(null);
        if (player == null || player.getTeam() == null) return List.of();
        
        if (player.getLineup() == null) {
            // Игрок без состава видит все тренировки команды
            return events.findAllByTeam_Id(player.getTeam().getId());
        } else {
            // Игрок с составом видит только свои тренировки
            return events.findAllBySquads_Id(player.getLineup().getId());
        }
    }

    public List<Event> getAllEventsForUser(Long userId) {
        User user = users.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Event> results;
        if (user.getRole() == Role.MANAGER || user.getRole() == Role.COACH) {
            results = getEventsForManager(userId);
        } else {
            results = getEventsForPlayer(userId);
        }
        
        for (Event event : results) {
            populateCompletedTasks(event, user);
        }
        return results;
    }

    private void populateCompletedTasks(Event event, User user) {
        java.util.List<String> tasks = new java.util.ArrayList<>();
        Long eventId = event.getId();

        if (user.getRole() == Role.MANAGER || user.getRole() == Role.COACH) {
            // Задачи менеджера: посещаемость и тесты
            if (attendance.existsByEventId(eventId)) {
                tasks.add("attendance");
            }
            if (event.getTrainingDetails() != null && event.getTrainingDetails().getTestTypes() != null) {
                for (TestType tt : event.getTrainingDetails().getTestTypes()) {
                    if (testResultRepository.existsByEvent_IdAndTestType(eventId, tt)) {
                        tasks.add(tt.name());
                    }
                }
            }
        } else {
            // Задачи игрока: ИВН, биометрия и персональные результаты тестов
            players.findByUserId(user.getId()).ifPresent(player -> {
                Long playerId = player.getId();
                
                // ИВН
                attendance.findFirstByEventIdAndPlayerId(eventId, playerId).ifPresent(att -> {
                    if (att.getRpeValue() != null) tasks.add("rpe");
                });

                // Bio
                if (bioMeasurements.existsByEventIdAndPlayerId(eventId, playerId)) {
                    tasks.add("BIOBANDING");
                }

                // Tests
                if (event.getTrainingDetails() != null && event.getTrainingDetails().getTestTypes() != null) {
                    for (TestType tt : event.getTrainingDetails().getTestTypes()) {
                        if (testResultRepository.existsByEvent_IdAndPlayer_IdAndTestType(eventId, playerId, tt)) {
                            tasks.add(tt.name());
                        }
                    }
                }
            });
        }
        event.setUserCompletedTasks(tasks);
    }

    private void saveSingleEvent(EventCreateDTO dto, LocalDate date, List<Lineup> selectedLineups, User manager, Team team, String groupId) {
        Event event = new Event();
        event.setManager(manager);
        event.setTeam(team);
        event.setType(dto.getType());
        event.setDate(date);
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setLocation(dto.getLocation());
        event.setSquads(selectedLineups);
        event.setGroupId(groupId);
        event.setRepeatUntil(dto.getRepeatUntil());
        if (dto.getDaysOfWeek() != null) {
            event.setDaysOfWeek(new java.util.ArrayList<>(dto.getDaysOfWeek()));
        }

        Event saved = events.save(event);

        if (dto.getType() == EventType.TRAINING && dto.getTrainingDetails() != null) {
            TrainingDetailsDTO tdDto = dto.getTrainingDetails();
            TrainingEvent te = new TrainingEvent();
            te.setEvent(saved);
            te.setSubtype(tdDto.getSubtype());
            te.setRpeEnabled(tdDto.isRpeEnabled());
            te.setTestTypes(tdDto.getTestTypes());
            trainingEvents.save(te);
        }
    }

    @Transactional
    public void createEvent(EventCreateDTO dto) {
        if (dto.getDate() == null) {
            throw new IllegalArgumentException("Начальная дата события не может быть пустой");
        }
        User manager = users.findById(dto.getManagerId()).orElse(null);
        Team team = dto.getTeamId() != null ? teams.findById(dto.getTeamId()).orElse(null) : null;
        List<Lineup> selectedLineups = lineups.findAllById(dto.getLineupIds());
        
        String groupId = (dto.getRepeatUntil() != null) ? java.util.UUID.randomUUID().toString() : null;

        if (dto.getDaysOfWeek() != null && !dto.getDaysOfWeek().isEmpty() && dto.getRepeatUntil() == null) {
            throw new IllegalArgumentException("При выборе повторения необходимо указать дату окончания серии");
        }

        if (dto.getRepeatUntil() == null) {
            saveSingleEvent(dto, dto.getDate(), selectedLineups, manager, team, groupId);
        } else {
            LocalDate current = dto.getDate();
            while (!current.isAfter(dto.getRepeatUntil())) {
                if (dto.getDaysOfWeek() != null && dto.getDaysOfWeek().contains(current.getDayOfWeek())) {
                    saveSingleEvent(dto, current, selectedLineups, manager, team, groupId);
                }
                current = current.plusDays(1);
            }
        }
    }

    @Transactional
    public void updateEvent(Long id, EventCreateDTO dto, String scope) {
        Event event = events.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        String groupId = event.getGroupId();
        
        // В этой модели мы не используем scope извне - если есть группа, значит это серия (ALL)
        if (groupId == null) {
            event.setDate(dto.getDate()); 
            applyChangesToEvent(event, dto);
        } else {
            List<Event> series = events.findByGroupId(groupId);
            LocalDateTime now = LocalDateTime.now();
            LocalDate today = now.toLocalDate();
            
            if ("SINGLE".equals(scope)) {
                // ГИБКОСТЬ: Обновляем только это событие, но ОСТАВЛЯЕМ его в серии (groupId не трогаем)
                event.setDate(dto.getDate());
                applyChangesToEvent(event, dto);
            } else {
                // МОНОЛИТ: Синхронизируем серию от сегодня до repeatUntil по паттерну
                LocalDate repeatUntil = dto.getRepeatUntil();
                
                // 1. ПРИНУДИТЕЛЬНАЯ ОЧИСТКА (удаляем всё, что не в паттерне или за лимитом ФИНИША)
                for (Event e : series) {
                    // Историю (всё что до сегодня) не трогаем
                    if (e.getDate().isBefore(today)) continue;

                    boolean isWithinLimit = repeatUntil == null || !e.getDate().isAfter(repeatUntil);
                    boolean isDayMatch = dto.getDaysOfWeek() != null && dto.getDaysOfWeek().contains(e.getDate().getDayOfWeek());

                    // Если вылетает за финиш или не попадает в дни недели — УДАЛЯЕМ
                    if (!isWithinLimit || !isDayMatch) {
                        events.delete(e);
                        continue;
                    }

                    // Обновляем метаданные выживших (время, место и т.д.)
                    applyChangesToEvent(e, dto);
                }

                // 2. ГЕНЕРАЦИЯ (досоздаем недостающие дни от сегодня до финиша)
                if (repeatUntil != null) {
                    User manager = users.findById(dto.getManagerId()).orElse(null);
                    Team team = dto.getTeamId() != null ? teams.findById(dto.getTeamId()).orElse(null) : null;
                    List<Lineup> lineupsList = lineups.findAllById(dto.getLineupIds());
                    
                    // Перечитываем актуальное состояние серии после чистки
                    List<LocalDate> existingDates = events.findByGroupId(groupId).stream()
                            .map(Event::getDate).collect(Collectors.toList());

                    LocalDate current = today; 
                    while (!current.isAfter(repeatUntil)) {
                        boolean shouldHave = dto.getDaysOfWeek() != null && dto.getDaysOfWeek().contains(current.getDayOfWeek());
                        if (shouldHave && !existingDates.contains(current)) {
                            saveSingleEvent(dto, current, lineupsList, manager, team, groupId);
                        }
                        current = current.plusDays(1);
                    }
                }
            }
        }
    }

    private void applyChangesToEvent(Event event, EventCreateDTO dto) {
        event.setType(dto.getType());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setLocation(dto.getLocation());
        event.setRepeatUntil(dto.getRepeatUntil());
        if (dto.getDaysOfWeek() != null) {
            event.setDaysOfWeek(new java.util.ArrayList<>(dto.getDaysOfWeek()));
        } else {
            event.setDaysOfWeek(null);
        }
        
        List<Lineup> selectedLineups = lineups.findAllById(dto.getLineupIds());
        event.setSquads(selectedLineups);

        if (dto.getType() == EventType.TRAINING && dto.getTrainingDetails() != null) {
            TrainingEvent details = event.getTrainingDetails();
            if (details == null) {
                details = new TrainingEvent();
                details.setEvent(event);
            }
            details.setSubtype(dto.getTrainingDetails().getSubtype());
            details.setRpeEnabled(dto.getTrainingDetails().isRpeEnabled());
            
            // Защита от NPE и корректное обновление коллекции тестов
            List<TestType> testTypes = dto.getTrainingDetails().getTestTypes();
            if (testTypes != null) {
                details.setTestTypes(new java.util.ArrayList<>(testTypes));
            } else {
                details.setTestTypes(new java.util.ArrayList<>());
            }
            
            trainingEvents.save(details);
            event.setTrainingDetails(details);
        } else {
            if (event.getTrainingDetails() != null) {
                trainingEvents.delete(event.getTrainingDetails());
                event.setTrainingDetails(null);
            }
        }
        events.save(event);
    }

    public List<TestResult> getTestResultsForEvent(Long eventId){
        return testResultRepository.findByEvent_Id(eventId);
    }

    @Transactional
    public void saveTestResultsBatch(Long eventId, TestType testType, List<TestResultBatchDto> dtos){
        Event event = events.findById(eventId).orElseThrow(()->new RuntimeException("Событие не найдено"));

        for(TestResultBatchDto dto : dtos){
            if(dto.getValue() == null) continue;
            Optional<TestResult> existing = testResultRepository.findByEvent_IdAndPlayer_IdAndTestType(eventId, dto.getPlayerId(), testType);

            TestResult result;
            if(existing.isPresent()){
                result = existing.get();
            } else {
                Player player = players.findById(dto.getPlayerId()).orElseThrow(()->new RuntimeException("Игрок не найден"));
                result = new TestResult();
                result.setEvent(event);
                result.setPlayer(player);
                result.setTestType(testType);
            }

            result.setTestValue(dto.getValue());
            result.setRecordedAt(LocalDateTime.now());
            testResultRepository.save(result);
        }
    }

    @Transactional
    public void saveAttendanceBatch(Long eventId, List<AttendanceBatchDto> dtos) {
        Event event = events.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        for (AttendanceBatchDto dto : dtos) {
            Optional<Attendance> existing = attendance.findFirstByEventIdAndPlayerId(eventId, dto.getPlayerId());
            Attendance record;
            if (existing.isPresent()) {
                record = existing.get();
            } else {
                record = new Attendance();
                record.setEvent(event);
                Player player = players.findById(dto.getPlayerId()).orElseThrow(() -> new RuntimeException("Player not found"));
                record.setPlayer(player);
            }
            record.setStatus(dto.getStatus());
            attendance.save(record);
        }
    }

    public List<AttendanceBatchDto> getAttendanceForEvent(Long eventId) {
        return attendance.findByEventId(eventId).stream().map(a -> {
            AttendanceBatchDto dto = new AttendanceBatchDto();
            dto.setPlayerId(a.getPlayer().getId());
            dto.setStatus(a.getStatus());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void saveAttendance(Long eventId, List<Attendance> records) {
        for (Attendance record : records) {
            Optional<Attendance> existing = attendance.findFirstByEventIdAndPlayerId(eventId, record.getPlayer().getId());
            if (existing.isPresent()) {
                Attendance update = existing.get();
                update.setStatus(record.getStatus());
                update.setReason(record.getReason());
                attendance.save(update);
            } else {
                attendance.save(record);
            }
        }
    }

    @Transactional
    public void savePlayerRpe(Long eventId, Long userId, RpeSubmitDto dto) {
        savePlayerRpe(eventId, userId, dto.getRpeValue());
    }

    @Transactional
    public void savePlayerRpe(Long eventId, Long userId, Integer rpeValue) {
        Player player = players.findByUserId(userId).orElseThrow(() -> new RuntimeException("Игрок не найден"));
        Optional<Attendance> existing = attendance.findFirstByEventIdAndPlayerId(eventId, player.getId());
        Attendance record;
        if (existing.isPresent()) {
            record = existing.get();
        } else {
            Event event = events.findById(eventId).orElseThrow(() -> new RuntimeException("Событие не найдено"));
            record = new Attendance();
            record.setEvent(event);
            record.setPlayer(player);
            // Если игрок готов - ставим PRESENT, иначе ABSENT
            record.setStatus(player.getStatus() == PlayerStatus.READY ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT);
        }
        record.setRpeValue(rpeValue);
        attendance.save(record);
    }

    @Transactional
    public String savePlayerBio(Long eventId, Long userId, BioSubmitDto dto) {
        Event event = events.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        Player player = players.findByUserId(userId).orElseThrow(() -> new RuntimeException("Player not found"));

        Optional<BioMeasurement> existing = bioMeasurements.findFirstByEventIdAndPlayerId(eventId, player.getId());
        BioMeasurement measure;
        if (existing.isPresent()) {
            measure = existing.get();
        } else {
            measure = new BioMeasurement();
            measure.setEvent(event);
            measure.setPlayer(player);
        }
        
        measure.setWeight(dto.getWeight());
        measure.setHeight(dto.getHeight());
        measure.setSittingHeight(dto.getSittingHeight());
        measure.setFatherHeight(dto.getFatherHeight());
        measure.setMotherHeight(dto.getMotherHeight());
        measure.setMeasuredAt(LocalDateTime.now());
        
        // === НАЧАЛО: Логика сохранения роста родителей в профиль Игрока ===
        boolean playerChanged = false;
        if (dto.getFatherHeight() != null && dto.getFatherHeight() > 0) {
            player.setFatherHeight(dto.getFatherHeight());
            playerChanged = true;
        }
        if (dto.getMotherHeight() != null && dto.getMotherHeight() > 0) {
            player.setMotherHeight(dto.getMotherHeight());
            playerChanged = true;
        }
        
        // Пересохраняем игрока, чтобы цифры навсегда остались в таблице players
        if (playerChanged) {
            players.save(player);
        }
        // === КОНЕЦ ===

        bioMeasurements.save(measure);
        return atlasIntegrationService.calculateAndSaveMetrics(measure.getPlayer().getId(), measure.getId());
    }

    @Transactional
    public void savePlayerBio(Long eventId, Long playerId, BioMeasurement measure) {
        Event event = events.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        Player player = players.findById(playerId).orElseThrow(() -> new RuntimeException("Player not found"));

        Optional<BioMeasurement> existing = bioMeasurements.findFirstByEventIdAndPlayerId(eventId, playerId);
        if (existing.isPresent()) {
            BioMeasurement old = existing.get();
            old.setWeight(measure.getWeight());
            old.setHeight(measure.getHeight());
            old.setSittingHeight(measure.getSittingHeight());
            old.setFatherHeight(measure.getFatherHeight());
            old.setMotherHeight(measure.getMotherHeight());
            old.setMeasuredAt(LocalDateTime.now());
            measure = old;
        } else {
            measure.setEvent(event);
            measure.setPlayer(player);
        }
        
        // === НАЧАЛО: Логика сохранения роста родителей в профиль Игрока ===
        boolean playerChanged = false;
        if (measure.getFatherHeight() != null && measure.getFatherHeight() > 0) {
            player.setFatherHeight(measure.getFatherHeight());
            playerChanged = true;
        }
        if (measure.getMotherHeight() != null && measure.getMotherHeight() > 0) {
            player.setMotherHeight(measure.getMotherHeight());
            playerChanged = true;
        }
        
        // Пересохраняем игрока, чтобы цифры навсегда остались в таблице players
        if (playerChanged) {
            players.save(player);
        }
        // === КОНЕЦ ===

        List<BioMeasurement> history = bioMeasurements.findAllByPlayerIdOrderByEventDateDesc(playerId);
        BioMeasurement lastMeasure = null;
        if (!history.isEmpty()) {
            if (measure.getId() != null && history.get(0).getId().equals(measure.getId())) {
                if (history.size() > 1) lastMeasure = history.get(1);
            } else {
                lastMeasure = history.get(0);
            }
        }
        
        measure.setApiResponse("{\"status\":\"success\", \"metrics\": {\"maturity\":\"late\", \"predHeight\": 185}}");
        bioMeasurements.save(measure);
    }

    public BioMeasurement getBioMeasurementForEvent(Long eventId, Long userId) {
        Player player = players.findByUserId(userId).orElse(null);
        if (player == null) return null;
        return bioMeasurements.findFirstByEventIdAndPlayerId(eventId, player.getId()).orElse(null);
    }

    public Integer getRpeValueForEvent(Long eventId, Long userId) {
        Player player = players.findByUserId(userId).orElse(null);
        if (player == null) return null;
        return attendance.findFirstByEventIdAndPlayerId(eventId, player.getId())
                .map(Attendance::getRpeValue)
                .orElse(null);
    }

    public BioMeasurement getLastBioMeasurement(Long userId) {
        Player player = players.findByUserId(userId).orElse(null);
        if (player == null) return null;
        return bioMeasurements.findAllByPlayerIdOrderByEventDateDesc(player.getId()).stream()
                .findFirst()
                .orElse(null);
    }

    public List<BioStatusDto> getBioStatusForEvent(Long eventId) {
        Event event = events.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        List<Player> eventPlayers;
        if (event.getSquads() != null && !event.getSquads().isEmpty()) {
            java.util.Set<Long> lineupIds = event.getSquads().stream()
                    .map(Lineup::getId)
                    .collect(java.util.stream.Collectors.toSet());
            eventPlayers = lineupIds.stream()
                    .flatMap(lid -> players.findAllByLineup_Id(lid).stream())
                    .distinct()
                    .collect(java.util.stream.Collectors.toList());
        } else if (event.getTeam() != null) {
            eventPlayers = players.findAllByTeam_Id(event.getTeam().getId());
        } else {
            eventPlayers = List.of();
        }

        java.util.Set<Long> measuredPlayerIds = bioMeasurements.findAllByEventId(eventId).stream()
                .map(m -> m.getPlayer() != null ? m.getPlayer().getId() : null)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());

        return eventPlayers.stream()
                .map(p -> new BioStatusDto(p.getId(), measuredPlayerIds.contains(p.getId())))
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void deleteEvent(Long id, String scope) {
        Event event = events.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        String groupId = event.getGroupId();
        
        if (groupId == null || "SINGLE".equals(scope)) {
            performSingleDelete(id);
        } else if ("ALL".equals(scope)) {
            List<Event> series = events.findByGroupId(groupId);
            for (Event e : series) {
                performSingleDelete(e.getId());
            }
        } else if ("FOLLOWING".equals(scope)) {
            List<Event> series = events.findByGroupId(groupId);
            for (Event e : series) {
                if (!e.getDate().isBefore(event.getDate())) {
                    performSingleDelete(e.getId());
                }
            }
        }
    }

    private void performSingleDelete(Long id) {
        attendance.deleteByEventId(id);
        testResultRepository.deleteByEvent_Id(id);
        bioMeasurements.deleteByEventId(id);
        events.deleteById(id);
    }
}
