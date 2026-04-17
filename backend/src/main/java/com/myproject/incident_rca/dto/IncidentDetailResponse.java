package com.myproject.incident_rca.dto;

import java.time.LocalDateTime;
import java.util.List;

public class IncidentDetailResponse {
    private Long id;
    private String serviceName;
    private String severity;
    private String errorMessage;
    private List<String> logs;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    // Constructors
    public IncidentDetailResponse(Long id, String serviceName, String severity, String errorMessage, List<String> logs, String status, LocalDateTime createdAt, LocalDateTime resolvedAt) {
        this.id = id;
        this.serviceName = serviceName;
        this.severity = severity;
        this.errorMessage = errorMessage;
        this.logs = logs;
        this.status = status;
        this.createdAt = createdAt;
        this.resolvedAt = resolvedAt;
    }

    // Getters

    public Long getId() {
        return id;
    }

    public String getServiceName() {
        return serviceName;
    }

    public String getSeverity() {
        return severity;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public List<String> getLogs() {
        return logs;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }
}
