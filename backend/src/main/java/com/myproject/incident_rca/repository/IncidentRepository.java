package com.myproject.incident_rca.repository;

import com.myproject.incident_rca.model.Incident;
import com.myproject.incident_rca.model.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.time.LocalDateTime;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // With severity filter
    Page<Incident> findAllByServiceNameContainingIgnoreCaseAndSeverityAndCreatedAtBetween(
            String serviceName,
            Severity severity,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    );

    // Without severity filter
    Page<Incident> findAllByServiceNameContainingIgnoreCaseAndCreatedAtBetween(
            String serviceName,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    );

}
