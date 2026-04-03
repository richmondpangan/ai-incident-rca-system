package com.myproject.incident_rca.repository;

import com.myproject.incident_rca.model.RCADocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RCADocumentRepository extends JpaRepository<RCADocument, Long> {
    Optional<RCADocument> findByIncidentId(Long incidentId);
}
