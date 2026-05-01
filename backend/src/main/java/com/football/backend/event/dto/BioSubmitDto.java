package com.football.backend.event.dto;

public class BioSubmitDto {
    private Integer weight;
    private Integer height;
    private Integer sittingHeight;
    private Integer fatherHeight;
    private Integer motherHeight;

    public Integer getWeight() { return weight; }
    public void setWeight(Integer weight) { this.weight = weight; }

    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }

    public Integer getSittingHeight() { return sittingHeight; }
    public void setSittingHeight(Integer sittingHeight) { this.sittingHeight = sittingHeight; }

    public Integer getFatherHeight() { return fatherHeight; }
    public void setFatherHeight(Integer fatherHeight) { this.fatherHeight = fatherHeight; }

    public Integer getMotherHeight() { return motherHeight; }
    public void setMotherHeight(Integer motherHeight) { this.motherHeight = motherHeight; }
}
