package com.football.backend.event.model;


import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name="training_details")
public class TrainingEvent {

    @Id
      private Long id;

    @OneToOne
    @MapsId // ID этой сущности будет равен ID связанного Event
    @JoinColumn(name = "event_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Event event;

    @Enumerated(EnumType.STRING)
    private TrainingSubtype subtype;

    private boolean rpeEnabled;

    @ElementCollection(targetClass = TestType.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "training_tests", joinColumns = @JoinColumn(name = "training_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "test_type")
    private List<TestType> testTypes;
    public TrainingEvent() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public TrainingSubtype getSubtype() { return subtype; }
    public void setSubtype(TrainingSubtype subtype) { this.subtype = subtype; }
    public boolean isRpeEnabled() { return rpeEnabled; }
    public void setRpeEnabled(boolean rpeEnabled) { this.rpeEnabled = rpeEnabled; }
    public List<TestType> getTestTypes() { return testTypes; }
    public void setTestTypes(List<TestType> testTypes) { this.testTypes = testTypes; }
}
