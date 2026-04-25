package com.myproject.incident_rca.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myproject.incident_rca.ai.client.GeminiClient;
import com.myproject.incident_rca.ai.config.GeminiProperties;
import com.myproject.incident_rca.ai.prompt.PromptBuilder;
import com.myproject.incident_rca.dto.AIAnalysisResponse;
import com.myproject.incident_rca.model.AIAnalysis;
import com.myproject.incident_rca.model.Incident;
import com.myproject.incident_rca.repository.AIAnalysisRepository;
import com.myproject.incident_rca.repository.IncidentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AIAnalysisServiceImpl implements AIAnalysisService {

    private final IncidentRepository incidentRepository;
    private final AIAnalysisRepository aiAnalysisRepository;

    private final GeminiClient geminiClient;
    private final PromptBuilder promptBuilder;
    private final GeminiProperties geminiProperties;

    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public AIAnalysisResponse analyzeIncident(Long incidentId) {

        // Validate if incident exist
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Incident not found: " + incidentId)
                );

        // Build prompt
        String prompt = promptBuilder.buildIncidentPrompt(incident);

        try {
            // Call gemini
            String rawResponse = geminiClient.analyze(prompt);

            // Parse and persist success
            AIAnalysis analysis = parseAndSaveSuccess(incident.getId(), rawResponse);

            return AIAnalysisResponse.from(analysis);
        } catch (Exception ex) {
            // Persist failure
            AIAnalysis failure = saveFailure(incident.getId(), ex.getMessage());
            return AIAnalysisResponse.from(failure);
        }
    }

    // Private helpers
    private AIAnalysis saveFailure(Long incidentId, String error) {

        AIAnalysis analysis = new AIAnalysis();
        analysis.setIncidentId(incidentId);
        analysis.setSummary("AI analysis failed");
        analysis.setConfidenceScore(0);
        analysis.setRawResponse(error);
        analysis.setModelName(geminiProperties.getModel());

        return aiAnalysisRepository.save(analysis);

    }

    private AIAnalysis parseAndSaveSuccess(Long incidentId, String rawResponse) {
        try {
            // GeminiClient already returns CLEAN JSON
            JsonNode aiJson = objectMapper.readTree(rawResponse);

            //System.out.println("===== PARSED AI JSON =====");
            //System.out.println(aiJson.toPrettyString());

            AIAnalysis analysis = new AIAnalysis();
            analysis.setIncidentId(incidentId);
            analysis.setSummary(aiJson.path("summary").asText());
            analysis.setProbableRootCause(aiJson.path("probable_root_cause").asText());
            analysis.setSuggestedRemediation(getSuggestedRemediation(aiJson));
            analysis.setConfidenceScore(aiJson.path("confidence_score").asInt());
            analysis.setRawResponse(rawResponse);
            analysis.setModelName(geminiProperties.getModel());

            return aiAnalysisRepository.save(analysis);

        } catch(Exception ex) {
            throw new RuntimeException("Failed to parse Gemini response", ex);
        }
    }

    private String getSuggestedRemediation(JsonNode json) {
        JsonNode node = json.get("suggested_remediation");

        if (node != null && node.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (JsonNode item : node) {
                sb.append("- ").append(item.asText()).append("\n");
            }
            return sb.toString();
        }

        return node != null ? node.asText() : "";
    }

    @Override
    public AIAnalysisResponse getLatestAnalysis(Long incidentId) {

        AIAnalysis analysis = aiAnalysisRepository
                .findTopByIncidentIdOrderByCreatedAtDesc(incidentId)
                .orElseThrow(() ->
                        new EntityNotFoundException("No AI analysis found for incident: " + incidentId)
                );

        return AIAnalysisResponse.from(analysis);
    }
}
