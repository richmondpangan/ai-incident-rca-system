package com.myproject.incident_rca.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myproject.incident_rca.ai.client.GeminiClient;
import com.myproject.incident_rca.ai.prompt.PromptBuilder;
import com.myproject.incident_rca.dto.RCAResponse;
import com.myproject.incident_rca.model.*;
import com.myproject.incident_rca.repository.AIAnalysisRepository;
import com.myproject.incident_rca.repository.IncidentRepository;
import com.myproject.incident_rca.repository.IncidentResolutionRepository;
import com.myproject.incident_rca.repository.RCADocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RCAServiceImpl implements RCAService {

    private final IncidentRepository incidentRepository;
    private final IncidentResolutionRepository resolutionRepository;
    private final AIAnalysisRepository aiAnalysisRepository;
    private final RCADocumentRepository rcaRepository;

    private final GeminiClient geminiClient;
    private final PromptBuilder promptBuilder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public RCAResponse generateRCA(Long incidentId) {

        // 1. Fetch Incident
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        // 2. Validate status
        if (incident.getStatus() == IncidentStatus.OPEN) {
            throw new RuntimeException("Cannot generate RCA for OPEN incident");
        }

        // 3. Fetch Resolution (REQUIRED)
        IncidentResolution resolution = resolutionRepository.findByIncidentId(incidentId)
                .orElseThrow(() -> new RuntimeException("Resolution is required"));

        // 4. Prevent duplicate
        if (rcaRepository.findByIncidentId(incidentId).isPresent()) {
            throw new RuntimeException("RCA already exists");
        }

        // 5. Fetch AI Analysis (OPTIONAL)
        AIAnalysis aiAnalysis = aiAnalysisRepository
                .findTopByIncidentIdOrderByCreatedAtDesc(incidentId)
                .orElse(null);

        // 6. Build prompt
        String prompt = promptBuilder.buildRCAPrompt(incident, resolution, aiAnalysis);

        // 7. Call AI
        String aiResponse = geminiClient.analyze(prompt);

        // 8. Parse + Save
        RCADocument saved = parseAndSave(aiResponse, incidentId);

        return mapToResponse(saved);
    }

    @Override
    public RCAResponse getRCAByIncidentId(Long incidentId) {

        RCADocument rca = rcaRepository.findByIncidentId(incidentId)
                .orElseThrow(() -> new RuntimeException("RCA not found"));

        return mapToResponse(rca);
    }

    @Override
    @Transactional
    public RCAResponse updateRCA(Long rcaId, RCAResponse request) {

        RCADocument rca = rcaRepository.findByIncidentId(rcaId)
                .orElseThrow(() -> new RuntimeException("RCA not found"));

        rca.setProblemStatement(request.getProblemStatement());
        rca.setBusinessImpact(request.getBusinessImpact());
        rca.setRootCause(request.getRootCause());
        rca.setResolution(request.getResolution());
        rca.setPreventiveActions(request.getPreventiveActions());

        return mapToResponse(rcaRepository.save(rca));
    }

    // =============================
    // 🔥 JSON Parsing + Fallback
    // =============================
    private RCADocument parseAndSave(String aiResponse, Long incidentId) {
        try {
            JsonNode json = objectMapper.readTree(aiResponse);

            RCADocument rca = RCADocument.builder()
                    .incidentId(incidentId)
                    .problemStatement(json.get("problem_statement").asText())
                    .businessImpact(json.get("business_impact").asText())
                    .rootCause(json.get("root_cause").asText())
                    .resolution(json.get("resolution").asText())
                    //.preventiveActions(json.get("preventive_actions").asText())
                    .preventiveActions(getPreventiveActions(json))
                    .generatedBy("AI")
                    .createdAt(LocalDateTime.now())
                    .build();

            return rcaRepository.save(rca);

        } catch (Exception e) {

            // Fallback
            RCADocument fallback = RCADocument.builder()
                    .incidentId(incidentId)
                    .problemStatement("RCA generation failed")
                    .businessImpact("RCA generation failed")
                    .rootCause("RCA generation failed")
                    .resolution("RCA generation failed")
                    .preventiveActions("RCA generation failed")
                    .generatedBy("AI_FALLBACK")
                    .createdAt(LocalDateTime.now())
                    .build();

            return rcaRepository.save(fallback);
        }
    }

    private String getPreventiveActions(JsonNode json) {
        JsonNode node = json.get("preventive_actions");

        if (node.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (JsonNode item : node) {
                sb.append("- ").append(item.asText()).append("\n");
            }
            return sb.toString();
        }

        return node.asText();
    }

    // =============================
    // Mapper
    // =============================
    private RCAResponse mapToResponse(RCADocument rca) {
        return RCAResponse.builder()
                .incidentId(rca.getIncidentId())
                .problemStatement(rca.getProblemStatement())
                .businessImpact(rca.getBusinessImpact())
                .rootCause(rca.getRootCause())
                .resolution(rca.getResolution())
                .preventiveActions(rca.getPreventiveActions())
                .createdAt(rca.getCreatedAt())
                .build();
    }
}