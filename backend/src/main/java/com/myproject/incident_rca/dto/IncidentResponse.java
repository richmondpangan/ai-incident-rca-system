package com.myproject.incident_rca.dto;

import java.time.LocalDateTime;

public class IncidentResponse {
    private Long id;
    private String serviceName;
    private String severity;
    private String errorMessage;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    // Constructors
    public IncidentResponse(Long id, String serviceName, String severity, String errorMessage, String status, LocalDateTime createdAt, LocalDateTime resolvedAt) {
        this.id = id;
        this.serviceName = serviceName;
        this.severity = severity;
        this.errorMessage = errorMessage;
        this.status = status;
        this.createdAt = createdAt;
        this.resolvedAt = resolvedAt;
    }

    // Getters only (immutable response)

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
