package com.myproject.incident_rca.controller;

import com.myproject.incident_rca.dto.CreateIncidentRequest;
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
                savedIncident.getStatus().name(),
                savedIncident.getCreatedAt()
        );

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public Page<IncidentResponse> listIncidents(
            @RequestParam(required = false) String serviceName,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Incident> incidentPage = incidentService.getIncidents(
                serviceName, severity, fromDate, toDate, pageable
        );

        return incidentPage.map(incident ->
                new IncidentResponse(
                        incident.getId(),
                        incident.getStatus().name(),
                        incident.getCreatedAt()
                )
        );
    }
}
