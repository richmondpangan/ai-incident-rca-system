package com.myproject.incident_rca.service;

import com.myproject.incident_rca.dto.AIAnalysisResponse;

public interface AIAnalysisService {
    AIAnalysisResponse analyzeIncident(Long incidentId);

    AIAnalysisResponse getLatestAnalysis(Long incidentId);
}
