package com.myproject.incident_rca.controller;

import com.myproject.incident_rca.dto.AIAnalysisResponse;
import com.myproject.incident_rca.service.AIAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentAnalysisController {

    private final AIAnalysisService aiAnalysisService;

    @PostMapping("/{id}/analyze")
    public ResponseEntity<AIAnalysisResponse> analyzeIncident(@PathVariable Long id) {
        AIAnalysisResponse response = aiAnalysisService.analyzeIncident(id);
        return ResponseEntity.ok(response);
    }

}
