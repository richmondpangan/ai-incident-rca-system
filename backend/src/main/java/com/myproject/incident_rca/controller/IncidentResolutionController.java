package com.myproject.incident_rca.controller;

import com.myproject.incident_rca.dto.IncidentResolutionResponse;
import com.myproject.incident_rca.dto.ResolveIncidentRequest;
import com.myproject.incident_rca.service.IncidentResolutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentResolutionController {

    private final IncidentResolutionService resolutionService;

    @PostMapping("/{id}/resolution")
    public ResponseEntity<IncidentResolutionResponse> resolveIncident(
            @PathVariable Long id,
            @Valid @RequestBody ResolveIncidentRequest request) {

        return ResponseEntity.ok(
                resolutionService.resolveIncident(id, request)
        );
    }

    @GetMapping("/{id}/resolution")
    public ResponseEntity<IncidentResolutionResponse> getResolution(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                resolutionService.getResolution(id)
        );
    }
}
