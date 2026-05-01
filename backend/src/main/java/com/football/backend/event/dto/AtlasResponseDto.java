package com.football.backend.event.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class AtlasResponseDto {

    private boolean success;
    private List<ResultMetrics> result;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public List<ResultMetrics> getResult() { return result; }
    public void setResult(List<ResultMetrics> result) { this.result = result; }

    public static class ResultMetrics {

        @JsonProperty("предполагаемый взрослый рост")
        private String expectedAdultHeight;

        @JsonProperty("степень достижения взрослого роста, %")
        private String adultHeightAchievementPercentage;

        @JsonProperty("стадия взросления")
        private String maturityStage;

        @JsonProperty("темп взросления")
        private String maturityPace;

        @JsonProperty("темп роста, темп веса")
        private List<String> growthAndWeightPace;

        @JsonProperty("риск по темпу роста, риск по темпу веса")
        private List<String> growthAndWeightRisk;

        @JsonProperty("предполагаемый возраст PHV и PWV")
        private List<String> predictedPhvAndPwvAge;

        @JsonProperty("хроно-возраст десятичный, био-возраст десятичный")
        private List<String> chronoAndBioAgeDecimal;

        public String getExpectedAdultHeight() { return expectedAdultHeight; }
        public void setExpectedAdultHeight(String expectedAdultHeight) { this.expectedAdultHeight = expectedAdultHeight; }

        public String getAdultHeightAchievementPercentage() { return adultHeightAchievementPercentage; }
        public void setAdultHeightAchievementPercentage(String adultHeightAchievementPercentage) { this.adultHeightAchievementPercentage = adultHeightAchievementPercentage; }

        public String getMaturityStage() { return maturityStage; }
        public void setMaturityStage(String maturityStage) { this.maturityStage = maturityStage; }

        public String getMaturityPace() { return maturityPace; }
        public void setMaturityPace(String maturityPace) { this.maturityPace = maturityPace; }

        public List<String> getGrowthAndWeightPace() { return growthAndWeightPace; }
        public void setGrowthAndWeightPace(List<String> growthAndWeightPace) { this.growthAndWeightPace = growthAndWeightPace; }

        public List<String> getGrowthAndWeightRisk() { return growthAndWeightRisk; }
        public void setGrowthAndWeightRisk(List<String> growthAndWeightRisk) { this.growthAndWeightRisk = growthAndWeightRisk; }

        public List<String> getPredictedPhvAndPwvAge() { return predictedPhvAndPwvAge; }
        public void setPredictedPhvAndPwvAge(List<String> predictedPhvAndPwvAge) { this.predictedPhvAndPwvAge = predictedPhvAndPwvAge; }

        public List<String> getChronoAndBioAgeDecimal() { return chronoAndBioAgeDecimal; }
        public void setChronoAndBioAgeDecimal(List<String> chronoAndBioAgeDecimal) { this.chronoAndBioAgeDecimal = chronoAndBioAgeDecimal; }
    }
}
