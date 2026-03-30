package com.myproject.incident_rca.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incident_resolution",
        uniqueConstraints = @UniqueConstraint(columnNames = "incident_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentResolution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One resolution per incident
    @OneToOne
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Column(name = "final_root_cause", nullable = false, columnDefinition = "TEXT")
    private String finalRootCause;

    @Column(name = "resolution_steps", nullable = false, columnDefinition = "TEXT")
    private String resolutionSteps;

    @Column(name = "resolved_by")
    private String resolvedBy;

    @Column(name = "resolved_at", nullable = false)
    private LocalDateTime resolvedAt;
}
