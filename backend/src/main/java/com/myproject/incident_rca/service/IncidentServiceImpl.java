package com.myproject.incident_rca.service;

import com.myproject.incident_rca.dto.CreateIncidentRequest;
import com.myproject.incident_rca.model.Incident;
import com.myproject.incident_rca.model.IncidentStatus;
import com.myproject.incident_rca.model.Severity;
import com.myproject.incident_rca.repository.IncidentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;

    public IncidentServiceImpl(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @Override
    public Incident createIncident(CreateIncidentRequest request) {
        // Input validation
        if (request.getServiceName().isBlank()) {
            throw new IllegalArgumentException("Service name cannot be blank");
        }
        if (request.getSeverity() == null) {
            throw new IllegalArgumentException("Severity must be provided");
        }
        if (request.getErrorMessage().isBlank()) {
            throw new IllegalArgumentException("Error message cannot be blank");
        }

        // Map DTO → Entity
        Incident incident = new Incident();
        incident.setServiceName(request.getServiceName());
        incident.setSeverity(request.getSeverity());
        incident.setErrorMessage(request.getErrorMessage());
        incident.setLogs(request.getLogs());

        // Set system-managed defaults
        incident.setStatus(IncidentStatus.OPEN);
        incident.setCreatedAt(LocalDateTime.now());

        // Persist entity
        return incidentRepository.save(incident);
    }

    @Override
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    @Override
    public Page<Incident> getIncidents(String serviceName, String severityStr, String fromDate, String toDate, Pageable pageable) {

        // findAll
        //Page<Incident> incidents = incidentRepository.findAll(pageable);

        // Safe defaults
        String svcNameFilter = (serviceName != null) ? serviceName : "";

        LocalDateTime from = (fromDate != null) ?
                LocalDateTime.parse(fromDate, DateTimeFormatter.ISO_DATE_TIME) :
                LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime to = (toDate != null) ?
                LocalDateTime.parse(toDate, DateTimeFormatter.ISO_DATE_TIME) :
                LocalDateTime.now();

        // Severity filter
        Severity severityFilter = null;
        if (severityStr != null && !severityStr.isBlank()) {
            severityFilter = Severity.valueOf(severityStr.toUpperCase());
        }

        // Call repository based on whether severity is provided
        if (severityFilter != null) {
            return incidentRepository.findAllByServiceNameContainingIgnoreCaseAndSeverityAndCreatedAtBetween(
                    svcNameFilter, severityFilter, from, to, pageable
            );
        } else {
            return incidentRepository.findAllByServiceNameContainingIgnoreCaseAndCreatedAtBetween(
                    svcNameFilter, from, to, pageable
            );
        }

    }

}
