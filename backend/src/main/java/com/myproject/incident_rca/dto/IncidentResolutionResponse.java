package com.myproject.incident_rca.dto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
public class IncidentResolutionResponse {
    private Long incidentId;
    private String finalRootCause;
    private String resolutionSteps;
    private String resolvedBy;
    private LocalDateTime resolvedAt;
}
