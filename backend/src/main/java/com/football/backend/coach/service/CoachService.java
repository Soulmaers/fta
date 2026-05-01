package com.football.backend.coach.service;


import com.football.backend.auth.model.Role;
import com.football.backend.auth.model.User;
import com.football.backend.auth.repository.UserRepository;
import com.football.backend.coach.dto.CoachSummaryDto;
import com.football.backend.coach.dto.RequestCoachDTO;
import com.football.backend.coach.model.Coach;
import com.football.backend.coach.model.CoachProfileType;
import com.football.backend.coach.repository.CoachRepository;
import com.football.backend.common.error.UserNotFoundException;
import com.football.backend.coach.dto.TeamCoachAssignmentRequestDto;
import com.football.backend.player.dto.PlayerSummaryDto;
import com.football.backend.player.model.Player;
import com.football.backend.team.dto.TeamResponseDTO;
import com.football.backend.team.dto.UpdateTeamRequestDTO;
import com.football.backend.team.model.Team;
import com.football.backend.team.repository.TeamRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class CoachService {
    private final UserRepository users;
    private final CoachRepository coaches;
    private final TeamRepository teams;
    private final PasswordEncoder encoder;

    private static final DateTimeFormatter BDAY_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final SecureRandom RND = new SecureRandom();
    private static final String PASS_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";


    public CoachService(UserRepository users, CoachRepository coaches, TeamRepository teams, PasswordEncoder encoder) {
        this.users = users;
        this.coaches = coaches;
        this.teams = teams;
        this.encoder = encoder;
    }




    @Transactional
    public CoachSummaryDto createCoach(Long userId, RequestCoachDTO req){
        User manager = users.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Менеджер не найден"));
        if (manager.getRole() != Role.MANAGER) {
            throw new RuntimeException("Доступ запрещён: только менеджер может создавать тренеров");
        }
        // 2) генерация логина
        String baseLogin = generateLogin(
                Role.COACH,
                manager.getId(),
                req.getFullName(),
                req.getBirthDate()
        );

        String login = makeUniqueLogin(baseLogin);
        System.out.println(login);
        String tempPassword = java.util.UUID.randomUUID().toString().substring(0, 10);
        String hash = encoder.encode(tempPassword);
        User coachUser=new User(login,hash, Role.COACH);

       users.save(coachUser);

        Coach coach = new Coach(coachUser, CoachProfileType.COACH_PROFILE, manager);
        coach.setFullName(req.getFullName());
        coach.setBirthDate(req.getBirthDate());
        coach.setPhotoUrl(req.getPhotoUrl());
        coach.setProfession(req.getProfession());
        System.out.println("коач "+ req.getFullName());
        coaches.save(coach);

        return new CoachSummaryDto(coach);
    }

    @Transactional(readOnly = true)
    public List<CoachSummaryDto> getCoaches(Long managerId) {
        return coaches.findAllByManagerIdAndVisibleTrue(managerId)
                .stream()
                .map(CoachSummaryDto::new)
                .toList();
    }

    public CoachSummaryDto updateCoach(Long coachId, RequestCoachDTO req){

        Coach coach = coaches.findById(coachId)
                .orElseThrow(() -> new UserNotFoundException("Тренер не найден"));

        coach.setBirthDate(req.getBirthDate());
        coach.setProfession(req.getProfession());
        coach.setPhotoUrl(req.getPhotoUrl());
        coach.setFullName(req.getFullName());
        Coach saved=coaches.save(coach);

        return new CoachSummaryDto(saved);
    }

    @Transactional
    public List<CoachSummaryDto> syncTeamAssignments(Long managerId, TeamCoachAssignmentRequestDto req) {
        Team team = teams.findById(req.getTeamId())
                .orElseThrow(() -> new RuntimeException("Команда не найдена"));

        // 1. Get current coaches assigned to this team
        List<Coach> currentTeamCoaches = coaches.findAllByTeam_Id(req.getTeamId());

        // 2. Identify coaches in the incoming request
        Set<Long> newCoachIds = req.getCoachIds().stream().collect(Collectors.toSet());

        // 3. Remove coaches from team if they are not in the new list
        for (Coach c : currentTeamCoaches) {
            if (!newCoachIds.contains(c.getId())) {
                c.setTeam(null);
            }
        }

        // 4. Assign coaches to team
        for (Long coachId : req.getCoachIds()) {
            Coach coach = coaches.findById(coachId)
                    .orElseThrow(() -> new RuntimeException("Тренер не найден: " + coachId));
            coach.setTeam(team);
        }

        coaches.flush();

        // 5. Return updated list of all manager's coaches
        return getCoaches(managerId);
    }

    public void deleteCoach(Long coachId, Long userId){

        Coach coach = coaches.findById(coachId)
                .orElseThrow(() -> new UserNotFoundException("Тренер не найден"));


        if (!coach.getManager().getId().equals(userId)) {
            throw new RuntimeException("Нет доступа");
        }
        coach.setVisible(false);
        coaches.save(coach);

    }


    @Transactional(readOnly = true)
    public CoachSummaryDto getCoachProperty(Long userId) {
        Coach coach = coaches.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Профиль тренера не найден"));
        return new CoachSummaryDto(coach);
    }


    private String makeUniqueLogin(String baseLogin) {
        if (!users.existsByLogin(baseLogin)) return baseLogin;

        for (int i = 2; i < 100; i++) {
            String candidate = baseLogin + "_" + i;
            if (!users.existsByLogin(candidate)) return candidate;
        }

        throw new RuntimeException("Не удалось сгенерировать уникальный логин");
    }

    private String generateLogin(
            Role role,
            Long managerId,
            String fullName,
            LocalDate birthDate
    ) {
        String rolePart = role.name().toLowerCase();

        char firstLetter = 'u'; // fallback
        if (fullName != null && !fullName.isBlank()) {
            firstLetter = translitFirstChar(fullName.charAt(0));
        }

        String datePart = birthDate != null
                ? birthDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                : "00000000";

        return rolePart + "_" + managerId + "_" + firstLetter + datePart;
    }

    private char translitFirstChar(char c) {
        return switch (Character.toLowerCase(c)) {
            case 'а' -> 'a';
            case 'б' -> 'b';
            case 'в' -> 'v';
            case 'г' -> 'g';
            case 'д' -> 'd';
            case 'е', 'ё' -> 'e';
            case 'ж' -> 'z';
            case 'и', 'й' -> 'i';
            case 'к' -> 'k';
            case 'л' -> 'l';
            case 'м' -> 'm';
            case 'н' -> 'n';
            case 'о' -> 'o';
            case 'п' -> 'p';
            case 'р' -> 'r';
            case 'с' -> 's';
            case 'т' -> 't';
            case 'у' -> 'u';
            case 'ф' -> 'f';
            case 'х' -> 'h';
            case 'ч' -> 'c';
            case 'ш', 'щ' -> 's';
            case 'ы' -> 'y';
            case 'э' -> 'e';
            case 'ю' -> 'u';
            case 'я' -> 'y';
            default -> Character.isLetter(c) ? Character.toLowerCase(c) : 'u';
        };
    }


}
