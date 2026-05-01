package com.football.backend.event.dto;

import com.football.backend.event.model.TestType;
import com.football.backend.event.model.TrainingSubtype;

import java.util.List;

public class TrainingDetailsDTO {

    private TrainingSubtype subtype;
    private boolean rpeEnabled;
    private List<TestType> testTypes;



    public TrainingDetailsDTO(){}


    public void setSubtype(TrainingSubtype subtype){this.subtype=subtype;}
    public void setRpeEnabled(boolean rpeEnabled){this.rpeEnabled=rpeEnabled;}
    public void setTestTypes(List<TestType> testTypes){this.testTypes=testTypes;}


    public TrainingSubtype getSubtype(){ return subtype;}
    public boolean isRpeEnabled(){ return rpeEnabled;}
    public List<TestType> getTestTypes(){ return testTypes;}
}
