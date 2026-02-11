package com.myproject.incident_rca.dto;

import com.myproject.incident_rca.model.AIAnalysis;

import java.time.LocalDateTime;

public class AIAnalysisResponse {

    private String summary;
    private String probableRootCause;
    private String suggestedRemediation;
    private int confidenceScore;
    private LocalDateTime createdAt;

    public static AIAnalysisResponse from(AIAnalysis analysis) {

        AIAnalysisResponse response = new AIAnalysisResponse();
        response.summary = analysis.getSummary();
        response.probableRootCause = analysis.getProbableRootCause();
        response.suggestedRemediation = analysis.getSuggestedRemediation();
        response.confidenceScore = analysis.getConfidenceScore();
        response.createdAt = analysis.getCreatedAt();

        return response;

    }

    public String getSummary() {
        return summary;
    }

    public String getProbableRootCause() {
        return probableRootCause;
    }

    public String getSuggestedRemediation() {
        return suggestedRemediation;
    }

    public int getConfidenceScore() {
        return confidenceScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

}
