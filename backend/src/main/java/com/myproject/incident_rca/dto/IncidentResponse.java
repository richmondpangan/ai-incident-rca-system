package com.myproject.incident_rca.dto;

import java.time.LocalDateTime;

public class IncidentResponse {
    private Long id;
    private String status;
    private LocalDateTime createdAt;

    // Constructors
    public IncidentResponse(Long id, String status, LocalDateTime createdAt) {
        this.id = id;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters only (immutable response)

    public Long getId() {
        return id;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

}
