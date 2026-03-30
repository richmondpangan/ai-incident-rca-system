package com.myproject.incident_rca.service;

import com.myproject.incident_rca.dto.IncidentResolutionResponse;
import com.myproject.incident_rca.dto.ResolveIncidentRequest;
import com.myproject.incident_rca.exception.ConflictException;
import com.myproject.incident_rca.exception.ResourceNotFoundException;
import com.myproject.incident_rca.model.Incident;
import com.myproject.incident_rca.model.IncidentResolution;
import com.myproject.incident_rca.model.IncidentStatus;
import com.myproject.incident_rca.repository.IncidentRepository;
import com.myproject.incident_rca.repository.IncidentResolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentResolutionServiceImpl implements IncidentResolutionService {

    private final IncidentRepository incidentRepository;
    private final IncidentResolutionRepository resolutionRepository;

    @Override
    public IncidentResolutionResponse resolveIncident(Long incidentId,
                                                      ResolveIncidentRequest request) {

        // 1. Fetch incident
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found"));

        // 2. Check if already resolved
        if (incident.getStatus() == IncidentStatus.RESOLVED) {
            throw new ConflictException("Incident already resolved");
        }

        // 3. Ensure no existing resolution
        resolutionRepository.findByIncidentId(incidentId)
                .ifPresent(r -> {
                    throw new ConflictException("Resolution already exists for this incident");
                });

        // 4. Create resolution
        IncidentResolution resolution = IncidentResolution.builder()
                .incident(incident)
                .finalRootCause(request.getFinalRootCause())
                .resolutionSteps(request.getResolutionSteps())
                .resolvedBy(request.getResolvedBy())
                .resolvedAt(LocalDateTime.now())
                .build();

        // 5. Update incident
        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolvedAt(LocalDateTime.now());

        // 6. Save
        resolutionRepository.save(resolution);
        incidentRepository.save(incident);

        // 7. Return response
        return mapToResponse(resolution);
    }

    @Override
    public IncidentResolutionResponse getResolution(Long incidentId) {

        IncidentResolution resolution = resolutionRepository.findByIncidentId(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Resolution not found"));

        return mapToResponse(resolution);
    }

    private IncidentResolutionResponse mapToResponse(IncidentResolution resolution) {
        return IncidentResolutionResponse.builder()
                .incidentId(resolution.getIncident().getId())
                .finalRootCause(resolution.getFinalRootCause())
                .resolutionSteps(resolution.getResolutionSteps())
                .resolvedBy(resolution.getResolvedBy())
                .resolvedAt(resolution.getResolvedAt())
                .build();
    }
}