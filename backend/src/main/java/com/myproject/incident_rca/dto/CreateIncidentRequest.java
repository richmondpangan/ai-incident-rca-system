package com.myproject.incident_rca.dto;

import com.myproject.incident_rca.model.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateIncidentRequest {

    @NotBlank(message = "Service name is required")
    private String serviceName;

    @NotNull(message = "Severity is required")
    private Severity severity;

    @NotBlank(message = "Error message is required")
    private String errorMessage;

    @Size(
            max = 20000,
            message = "Logs must not exceed 20KB"
    )
    private String logs;

    // Getters and setters

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getLogs() {
        return logs;
    }

    public void setLogs(String logs) {
        this.logs = logs;
    }

}
