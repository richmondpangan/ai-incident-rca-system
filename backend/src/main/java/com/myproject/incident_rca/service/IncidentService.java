package com.myproject.incident_rca.service;

import com.myproject.incident_rca.dto.CreateIncidentRequest;
import com.myproject.incident_rca.model.Incident;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IncidentService {

    Incident createIncident(CreateIncidentRequest request);

    List<Incident> getAllIncidents();

    Page<Incident> getIncidents(String serviceName, String severity, String status, String fromDate, String toDate, Pageable pageable);

    Incident getIncidentById(Long id);
}
