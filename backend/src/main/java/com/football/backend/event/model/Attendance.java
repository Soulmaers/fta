package com.football.backend.event.model;
import com.football.backend.player.model.Player;
import jakarta.persistence.*;
@Entity
@Table(name="attendance")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // СВЯЗЬ С СОБЫТИЕМ
    // Много записей посещаемости могут относиться к ОДНОМУ событию
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    // СВЯЗЬ С ИГРОКОМ
    // Много записей посещаемости могут относиться к ОДНОМУ игроку (разные даты)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;


    // ОЦЕНКА ИВН (может быть пустой, если это матч)
    @Column(name = "rpe_value")
    private Integer rpeValue;


    @Column(name = "reason")
    private String reason;


    public Attendance() {}


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public Player getPlayer() { return player; }
    public void setPlayer(Player player) { this.player = player; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public Integer getRpeValue() { return rpeValue; }
    public void setRpeValue(Integer rpeValue) { this.rpeValue = rpeValue; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}