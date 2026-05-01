package com.football.backend.status.model;


import com.football.backend.player.model.Player;
import com.football.backend.player.model.PlayerStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.AnyDiscriminatorImplicitValues;

import java.time.LocalDateTime;

@Entity
@Table(name="player_status_history")
public class PlayerStatusHistory  {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
   private Long id;

    @ManyToOne(optional=false)
   @JoinColumn(name="player_id")
    private Player player;

    @Enumerated(EnumType.STRING)
    @Column(name="status")
private PlayerStatus status;

    @Column(name="change_time")
    private LocalDateTime changeTime;


    protected PlayerStatusHistory(){}

    public PlayerStatusHistory(Player player, PlayerStatus status){
        this.player=player;
        this.status=status;
        this.changeTime = LocalDateTime.now();
    }


    public PlayerStatus getStatus() {
        return status;
    }
    public Long getId() { return id; }
    public LocalDateTime getChangeTime() { return changeTime; }
    public Player getPlayer() { return player; }

}
