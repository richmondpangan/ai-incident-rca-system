package com.myproject.incident_rca.controller;

import com.myproject.incident_rca.dto.RCAResponse;
import com.myproject.incident_rca.service.RCAService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class RCAController {

    private final RCAService rcaService;

    @PostMapping("/{id}/generate-rca")
    public ResponseEntity<RCAResponse> generateRCA(@PathVariable Long id) {
        return ResponseEntity.ok(rcaService.generateRCA(id));
    }

    @GetMapping("/{id}/rca")
    public ResponseEntity<RCAResponse> getRCA(@PathVariable Long id) {
        return ResponseEntity.ok(rcaService.getRCAByIncidentId(id));
    }

    @PutMapping("/rca/{id}")
    public ResponseEntity<RCAResponse> updateRCA(
            @PathVariable Long id,
            @RequestBody RCAResponse request) {

        return ResponseEntity.ok(rcaService.updateRCA(id, request));
    }
}
