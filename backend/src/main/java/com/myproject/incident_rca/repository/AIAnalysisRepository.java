package com.myproject.incident_rca.repository;

import com.myproject.incident_rca.model.AIAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AIAnalysisRepository extends JpaRepository<AIAnalysis, Long> {

    List<AIAnalysis> findByIncidentIdOrderByCreatedAtDesc(Long incidentId);

}
