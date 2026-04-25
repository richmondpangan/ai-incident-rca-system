package com.myproject.incident_rca.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rca_document")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RCADocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id", nullable = false)
    private Long incidentId;

    @Column(name = "problem_statement", columnDefinition = "TEXT")
    private String problemStatement;

    @Column(name = "business_impact", columnDefinition = "TEXT")
    private String businessImpact;

    @Column(name = "root_cause", columnDefinition = "TEXT")
    private String rootCause;

    @Column(name = "resolution", columnDefinition = "TEXT")
    private String resolution;

    @Column(name = "preventive_actions", columnDefinition = "TEXT")
    private String preventiveActions;

    @Column(name = "generated_by")
    private String generatedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}