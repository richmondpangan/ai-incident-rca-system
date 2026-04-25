package com.myproject.incident_rca.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analysis")
public class AIAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id", nullable = false)
    private Long incidentId;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "probable_root_cause", columnDefinition = "TEXT")
    private String probableRootCause;

    @Column(name = "suggested_remediation", columnDefinition = "TEXT")
    private String suggestedRemediation;

    @Column(name = "confidence_score")
    private Integer confidenceScore;

    @Column(name = "raw_response", columnDefinition = "TEXT")
    private String rawResponse;

    @Column(name = "model_name", columnDefinition = "TEXT")
    private String modelName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor
    public AIAnalysis() {

    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(Long incidentId) {
        this.incidentId = incidentId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getProbableRootCause() {
        return probableRootCause;
    }

    public void setProbableRootCause(String probableRootCause) {
        this.probableRootCause = probableRootCause;
    }

    public String getSuggestedRemediation() {
        return suggestedRemediation;
    }

    public void setSuggestedRemediation(String suggestedRemediation) {
        this.suggestedRemediation = suggestedRemediation;
    }

    public Integer getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Integer confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getRawResponse() {
        return rawResponse;
    }

    public void setRawResponse(String rawResponse) {
        this.rawResponse = rawResponse;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
