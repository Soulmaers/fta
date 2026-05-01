package com.football.backend.team.dto;



public class RequestTeamDTO {

    private String nameTeam;
    private int foundedYear;
    private String logoUrl;

    public RequestTeamDTO() {

    }

        public void setNameTeam(String nameTeam){
            this.nameTeam=nameTeam;
        }
    public void setFoundedYear(int foundedYear){
        this.foundedYear=foundedYear;
    }
    public void setLogoUrl(String logoUrl){
        this.logoUrl=logoUrl;
    }
      public String getNameTeam() { return nameTeam; }
    public int getFoundedYear() { return foundedYear; }
    public String getLogoUrl() { return logoUrl; }


}
