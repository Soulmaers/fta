package com.football.backend.event.model;
import com.football.backend.auth.model.User;
import com.football.backend.lineup.model.Lineup;
import com.football.backend.team.model.Team;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
@Entity
@Table(name="events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;
    @Column(name="date", nullable = false)
    private LocalDate date;
    @Column(name="start_time")
    private LocalTime startTime;
    @Column(name="end_time")
    private LocalTime endTime;
    @Column
    private String location;
    @ManyToMany
    @JoinTable(
            name = "event_lineups",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "lineup_id")
    )
    private List<Lineup> squads;
    
    @Column(name = "group_id")
    private String groupId;

    @Column(name = "repeat_until")
    private LocalDate repeatUntil;

    @ElementCollection(targetClass = java.time.DayOfWeek.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "event_days_of_week", joinColumns = @JoinColumn(name = "event_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private java.util.List<java.time.DayOfWeek> daysOfWeek;

    @OneToOne(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private TrainingEvent trainingDetails;

    // Свойство, которое не хранится в БД, а вычисляется и отдается на клиент
    @Transient
    private java.util.List<String> userCompletedTasks;

    public Event() {}
    // ГЕТТЕРЫ И СЕТТЕРЫ
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }
    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
    public EventType getType() { return type; }
    public void setType(EventType type) { this.type = type; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public List<Lineup> getSquads() { return squads; }
    public void setSquads(List<Lineup> squads) { this.squads = squads; }
    public TrainingEvent getTrainingDetails() { return trainingDetails; }
    public void setTrainingDetails(TrainingEvent trainingDetails) { this.trainingDetails = trainingDetails; }
    
    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }
    
    public java.util.List<String> getUserCompletedTasks() { return userCompletedTasks; }
    public void setUserCompletedTasks(java.util.List<String> userCompletedTasks) { this.userCompletedTasks = userCompletedTasks; }

    public LocalDate getRepeatUntil() { return repeatUntil; }
    public void setRepeatUntil(LocalDate repeatUntil) { this.repeatUntil = repeatUntil; }
    public java.util.List<java.time.DayOfWeek> getDaysOfWeek() { return daysOfWeek; }
    public void setDaysOfWeek(java.util.List<java.time.DayOfWeek> daysOfWeek) { this.daysOfWeek = daysOfWeek; }
public Long getTeamId(){
    return team != null ? team.getId() : null;
}
public Integer getTeamFoundedYear(){
    return team != null ? team.getFoundedYear() : null;
}

}