package com.football.backend.player.service;

import com.football.backend.auth.model.Role;
import com.football.backend.auth.model.User;
import com.football.backend.auth.repository.UserRepository;
import com.football.backend.coach.dto.CoachSummaryDto;
import com.football.backend.coach.dto.RequestCoachDTO;
import com.football.backend.coach.model.Coach;
import com.football.backend.common.error.UserNotFoundException;
import com.football.backend.lineup.repository.LineupRepository;
import com.football.backend.player.dto.CreateRequestPlayerDTO;
import com.football.backend.player.dto.CreateResponsePlayerDTO;
import com.football.backend.player.dto.PlayerSummaryDto;
import com.football.backend.player.dto.TeamAssignmentRequestDto;
import com.football.backend.player.model.Player;
import com.football.backend.player.model.PlayerGameStatus;
import com.football.backend.player.model.PlayerStatus;
import com.football.backend.player.repository.PlayerRepository;
import com.football.backend.status.model.PlayerStatusHistory;
import com.football.backend.status.repository.PlayerStatusHistoryRepository;
import com.football.backend.team.repository.TeamRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import com.football.backend.team.model.Team;
import com.football.backend.lineup.model.Lineup;
import com.football.backend.player.dto.PlayerAssignmentDto;

@Service
public class PlayerService {

    private final UserRepository users;
    private final PlayerRepository players;
    private final TeamRepository teams;
    private final LineupRepository lineups;
    private final PasswordEncoder encoder;
private final PlayerStatusHistoryRepository playerHistoryStatus;
    public PlayerService(UserRepository users, TeamRepository teams, LineupRepository lineups, PlayerRepository players, PasswordEncoder encoder,PlayerStatusHistoryRepository playerHistoryStatus) {
        this.users = users;
        this.players = players;
        this.teams = teams;
        this.lineups = lineups;
        this.encoder = encoder;
        this.playerHistoryStatus=playerHistoryStatus;
    }


    @Transactional
    public PlayerSummaryDto createPlayer(Long userId, CreateRequestPlayerDTO req){
        User manager = users.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Менеджер не найден"));
        if (manager.getRole() != Role.MANAGER) {
            throw new RuntimeException("Доступ запрещён: только менеджер может создавать игроков");
        }
        // 2) генерация логина
        String baseLogin = generateLogin(
                Role.PLAYER,
                manager.getId(),
                req.getFullName(),
                req.getBirthDate()
        );

        String login = makeUniqueLogin(baseLogin);
               String tempPassword = java.util.UUID.randomUUID().toString().substring(0, 10);
        String hash = encoder.encode(tempPassword);
        User playerUser=new User(login,hash, Role.PLAYER);

        users.save(playerUser);

        Player player  = new Player(playerUser, PlayerStatus.READY, PlayerGameStatus.UNDEFINED,manager);
        player.setFullName(req.getFullName());
        player.setBirthDate(req.getBirthDate());
        player.setPhotoUrl(req.getPhotoUrl());
        player.setPosition(req.getPosition());
        player.setLeg(req.getLeg());
        player.setNumber(req.getNumber());
        player.setHeight(req.getHeight());
        player.setWeight(req.getWeight());
        players.save(player);
        
        System.out.println("Player created with ID: " + player.getId());

        playerHistoryStatus.save(new PlayerStatusHistory(player,player.getStatus()));
        return new PlayerSummaryDto(player);
    }



    @Transactional
    public  PlayerSummaryDto updatePlayerStatus(Long userId, PlayerStatus status){
        Player player = players.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Профиль игрока не найден"));
        player.setStatus(status);
        players.save(player);
        playerHistoryStatus.save(new PlayerStatusHistory(player,player.getStatus()));

        return new PlayerSummaryDto(player);
    }


    @Transactional(readOnly = true)
    public List<PlayerSummaryDto> getPlayers(Long userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));

        if (user.getRole() == Role.PLAYER) {
            // Если зашел игрок — находим его команду и возвращаем всех игроков этой команды
            return players.findByUserId(userId)
                    .map(p -> {
                        if (p.getTeam() != null) {
                            return players.findAllByTeam_Id(p.getTeam().getId()).stream()
                                    .map(PlayerSummaryDto::new)
                                    .toList();
                        }
                        return List.of(new PlayerSummaryDto(p));
                    })
                    .orElse(List.of());
        }

        // Если зашел менеджер — возвращаем всех его игроков
        return players.findAllByManagerIdAndVisibleTrue(userId)
                .stream()
                .map(PlayerSummaryDto::new)
                .toList();
    }


    @Transactional(readOnly = true)
    public PlayerSummaryDto getPlayerProperty(Long userId) {
        Player player = players.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Профиль игрока не найден"));
        return new PlayerSummaryDto(player);
    }

    @Transactional(readOnly = true)
    public String getPlayerStatusAtDate(Long userId, LocalDate date) {
        Player player = players.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Профиль игрока не найден"));

        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        return playerHistoryStatus
                .findTopByPlayerIdAndChangeTimeLessThanEqualOrderByChangeTimeDesc(player.getId(), endOfDay)
                .map(h -> h.getStatus().name())
                .orElse(player.getStatus().name());
    }
    public void deletePlayer(Long playerId, Long userId){
        System.out.println(">>> deletePlayer: playerId=" + playerId + ", userId=" + userId);

        Player player = players.findById(playerId)
                .orElseThrow(() -> {
                    System.out.println("!!! Player NOT FOUND: " + playerId);
                    return new UserNotFoundException("Игрок с ID " + playerId + " не найден");
                });

        System.out.println("Processing Player: " + player.getId() + ", Manager: " + player.getManager().getId());
        
        if (!player.getManager().getId().equals(userId)) {
            System.out.println("!!! Access Denied. Manager: " + player.getManager().getId() + " != Request: " + userId);
            throw new RuntimeException("Нет доступа: ID менеджера не совпадает");
        }
        player.setVisible(false);
        players.save(player);
        System.out.println(">>> Player " + playerId + " deleted (visible=false)");
    }

    @Transactional
    public PlayerSummaryDto updatePlayer(Long playerId, CreateRequestPlayerDTO req){
        System.out.println(">>> updatePlayer: playerId=" + playerId);
        Player player = players.findById(playerId)
                .orElseThrow(() -> {
                     System.out.println("!!! Player NOT FOUND: " + playerId);
                     return new UserNotFoundException("Игрок не найден");
                });
        
        player.setFullName(req.getFullName());
        player.setBirthDate(req.getBirthDate());
        player.setPhotoUrl(req.getPhotoUrl());
        player.setPosition(req.getPosition());
        player.setLeg(req.getLeg());
        player.setNumber(req.getNumber());
        player.setHeight(req.getHeight());
        player.setWeight(req.getWeight());
        
        System.out.println("Saving player updates: " + player.getId() + " " + player.getFullName());
        Player saved = players.saveAndFlush(player);
        return new PlayerSummaryDto(saved);
    }

    @Transactional
    public List<PlayerSummaryDto> syncTeamAssignments(Long managerId, TeamAssignmentRequestDto req) {
        Team team = teams.findById(req.getTeamId())
                .orElseThrow(() -> new RuntimeException("Команда не найдена"));

        // 1. Get current players assigned to this team
        List<Player> currentTeamPlayers = players.findAllByTeam_Id(req.getTeamId());

        // 2. Identify players in the incoming request
        Set<Long> newPlayerIds = req.getAssignments().stream()
                .map(PlayerAssignmentDto::getPlayerId)
                .collect(Collectors.toSet());

        // 3. Remove players from team/lineup if they are not in the new list
        for (Player p : currentTeamPlayers) {
            if (!newPlayerIds.contains(p.getId())) {
                p.setTeam(null);
                p.setLineup(null);
            }
        }

        // 4. Assign players to team and specified lineup
        for (PlayerAssignmentDto assign : req.getAssignments()) {
            Player player = players.findById(assign.getPlayerId())
                    .orElseThrow(() -> new RuntimeException("Игрок не найден: " + assign.getPlayerId()));

            player.setTeam(team);

            if (assign.getLineupId() != null) {
                Lineup lineup = lineups.findById(assign.getLineupId())
                        .orElseThrow(() -> new RuntimeException("Состав не найден: " + assign.getLineupId()));
                player.setLineup(lineup);
            } else {
                player.setLineup(null);
            }
        }

        players.flush();

        // 5. Return updated list of all manager's players
        return getPlayers(managerId);
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
