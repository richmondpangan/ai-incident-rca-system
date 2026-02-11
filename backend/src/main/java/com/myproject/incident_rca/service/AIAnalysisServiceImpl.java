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

            JsonNode root = objectMapper.readTree(rawResponse);

            // Navigate Gemini structure
            String text = root
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            // Remove markdown ```json wrapper
            text = text.replace("```json", "")
                    .replace("```", "")
                    .trim();

            // Parse actual structured JSON
            JsonNode aiJson = objectMapper.readTree(text);

            AIAnalysis analysis = new AIAnalysis();
            analysis.setIncidentId(incidentId);
            analysis.setSummary(aiJson.path("summary").asText());
            analysis.setProbableRootCause(aiJson.path("probable_root_cause").asText());
            analysis.setSuggestedRemediation(aiJson.path("suggested_remediation").toString());
            analysis.setConfidenceScore(aiJson.path("confidence_score").asInt());
            analysis.setRawResponse(rawResponse);
            analysis.setModelName(geminiProperties.getModel());

            return aiAnalysisRepository.save(analysis);

        } catch(Exception ex) {
            throw new RuntimeException("Failed to parse Gemini response", ex);
        }

    }

}
