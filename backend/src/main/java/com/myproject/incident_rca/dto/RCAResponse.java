package com.myproject.incident_rca.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RCAResponse {

    private Long incidentId;
    private String problemStatement;
    private String businessImpact;
    private String rootCause;
    private String resolution;
    private String preventiveActions;
    private LocalDateTime createdAt;
}
