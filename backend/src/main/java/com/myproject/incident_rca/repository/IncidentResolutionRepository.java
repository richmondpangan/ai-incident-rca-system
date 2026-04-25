package com.myproject.incident_rca.repository;

import com.myproject.incident_rca.model.IncidentResolution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IncidentResolutionRepository
        extends JpaRepository<IncidentResolution, Long> {

    Optional<IncidentResolution> findByIncidentId(Long incidentId);
}