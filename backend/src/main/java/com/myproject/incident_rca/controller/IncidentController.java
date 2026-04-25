package com.myproject.incident_rca.controller;

import com.myproject.incident_rca.dto.CreateIncidentRequest;
import com.myproject.incident_rca.dto.IncidentDetailResponse;
import com.myproject.incident_rca.dto.IncidentResponse;
import com.myproject.incident_rca.model.Incident;
import com.myproject.incident_rca.service.IncidentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ResponseEntity<IncidentResponse> createIncident(
            @Valid @RequestBody CreateIncidentRequest request
    ) {
        // Call Service Layer with DTO
        Incident savedIncident = incidentService.createIncident(request);

        // Map Entity → Response DTO
        IncidentResponse response = new IncidentResponse(
                savedIncident.getId(),
                savedIncident.getServiceName(),
                savedIncident.getSeverity().name(),
                savedIncident.getErrorMessage(),
                savedIncident.getStatus().name(),
                savedIncident.getCreatedAt(),
                savedIncident.getResolvedAt()
        );

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public Page<IncidentResponse> listIncidents(
            @RequestParam(required = false) String serviceName,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Incident> incidentPage = incidentService.getIncidents(
                serviceName, severity, status, fromDate, toDate, pageable
        );

        return incidentPage.map(incident ->
                new IncidentResponse(
                        incident.getId(),
                        incident.getServiceName(),
                        incident.getSeverity().name(),
                        incident.getErrorMessage(),
                        incident.getStatus().name(),
                        incident.getCreatedAt(),
                        incident.getResolvedAt()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentDetailResponse> getIncidentById(@PathVariable Long id) {
        Incident incident = incidentService.getIncidentById(id);

        List<String> logs = incident.getLogs() != null
                ? Arrays.asList(incident.getLogs().split("\\n"))
                : Collections.emptyList();

        IncidentDetailResponse response = new IncidentDetailResponse(
                incident.getId(),
                incident.getServiceName(),
                incident.getSeverity().name(),
                incident.getErrorMessage(),
                logs,
                incident.getStatus().name(),
                incident.getCreatedAt(),
                incident.getResolvedAt()
        );

        return ResponseEntity.ok(response);
    }
}
