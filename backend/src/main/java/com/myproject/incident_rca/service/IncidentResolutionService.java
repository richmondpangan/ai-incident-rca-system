package com.myproject.incident_rca.service;

import com.myproject.incident_rca.dto.IncidentResolutionResponse;
import com.myproject.incident_rca.dto.ResolveIncidentRequest;

public interface IncidentResolutionService {

    IncidentResolutionResponse resolveIncident(Long incidentId,
                                               ResolveIncidentRequest request);

    IncidentResolutionResponse getResolution(Long incidentId);
}
