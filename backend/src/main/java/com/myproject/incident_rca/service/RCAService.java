package com.myproject.incident_rca.service;

import com.myproject.incident_rca.dto.RCAResponse;

public interface RCAService {

    RCAResponse generateRCA(Long incidentId);

    RCAResponse getRCAByIncidentId(Long incidentId);

    RCAResponse updateRCA(Long rcaId, RCAResponse request);

}
