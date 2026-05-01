package com.football.backend.event.model;

import com.football.backend.player.model.Player;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bio_measurements")
public class BioMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private Integer weight;
    private Integer height;
    
    @Column(name = "sitting_height")
    private Integer sittingHeight;

    @Column(name = "father_height")
    private Integer fatherHeight;

    @Column(name = "mother_height")
    private Integer motherHeight;

    @Column(name = "measured_at")
    private LocalDateTime measuredAt;

    @Column(name = "api_response", columnDefinition = "TEXT")
    private String apiResponse;

    public BioMeasurement() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Player getPlayer() { return player; }
    public void setPlayer(Player player) { this.player = player; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public Integer getWeight() { return weight; }
    public void setWeight(Integer weight) { this.weight = weight; }

    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }

    public Integer getSittingHeight() { return sittingHeight; }
    public void setSittingHeight(Integer sittingHeight) { this.sittingHeight = sittingHeight; }

    public LocalDateTime getMeasuredAt() { return measuredAt; }
    public void setMeasuredAt(LocalDateTime measuredAt) { this.measuredAt = measuredAt; }

    public String getApiResponse() { return apiResponse; }
    public void setApiResponse(String apiResponse) { this.apiResponse = apiResponse; }

    public Integer getFatherHeight() { return fatherHeight; }
    public void setFatherHeight(Integer fatherHeight) { this.fatherHeight = fatherHeight; }

    public Integer getMotherHeight() { return motherHeight; }
    public void setMotherHeight(Integer motherHeight) { this.motherHeight = motherHeight; }
}
