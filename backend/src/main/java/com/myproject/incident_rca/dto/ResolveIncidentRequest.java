package com.myproject.incident_rca.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResolveIncidentRequest {
    @NotBlank(message = "Final root cause is required")
    private String finalRootCause;

    @NotBlank(message = "Resolution steps are required")
    private String resolutionSteps;

    private String resolvedBy;
}
