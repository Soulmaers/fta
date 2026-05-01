package com.football.backend.event.dto;

import java.util.List;

public class AtlasRequestDto {
    private List<AtlasPlayerDto> players;

    public AtlasRequestDto(List<AtlasPlayerDto> players) {
        this.players = players;
    }

    public List<AtlasPlayerDto> getPlayers() {
        return players;
    }

    public void setPlayers(List<AtlasPlayerDto> players) {
        this.players = players;
    }

    public static class AtlasPlayerDto {
        private String kidsDateBirt;
        private String gender;
        private Integer heightMother;
        private Integer heightFather;
        private List<AtlasMeasurementDto> regularData;

        public AtlasPlayerDto(String kidsDateBirt, String gender, Integer heightMother, Integer heightFather, List<AtlasMeasurementDto> regularData) {
            this.kidsDateBirt = kidsDateBirt;
            this.gender = gender;
            this.heightMother = heightMother;
            this.heightFather = heightFather;
            this.regularData = regularData;
        }

        public String getKidsDateBirt() { return kidsDateBirt; }
        public void setKidsDateBirt(String kidsDateBirt) { this.kidsDateBirt = kidsDateBirt; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }

        public Integer getHeightMother() { return heightMother; }
        public void setHeightMother(Integer heightMother) { this.heightMother = heightMother; }

        public Integer getHeightFather() { return heightFather; }
        public void setHeightFather(Integer heightFather) { this.heightFather = heightFather; }

        public List<AtlasMeasurementDto> getRegularData() { return regularData; }
        public void setRegularData(List<AtlasMeasurementDto> regularData) { this.regularData = regularData; }
    }

    public static class AtlasMeasurementDto {
        private String dateMes;
        private Integer height;
        private Integer heightSit;
        private Integer weight;

        public AtlasMeasurementDto(String dateMes, Integer height, Integer heightSit, Integer weight) {
            this.dateMes = dateMes;
            this.height = height;
            this.heightSit = heightSit;
            this.weight = weight;
        }

        public String getDateMes() { return dateMes; }
        public void setDateMes(String dateMes) { this.dateMes = dateMes; }

        public Integer getHeight() { return height; }
        public void setHeight(Integer height) { this.height = height; }

        public Integer getHeightSit() { return heightSit; }
        public void setHeightSit(Integer heightSit) { this.heightSit = heightSit; }

        public Integer getWeight() { return weight; }
        public void setWeight(Integer weight) { this.weight = weight; }
    }
}
