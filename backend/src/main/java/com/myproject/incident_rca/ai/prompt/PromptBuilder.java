package com.myproject.incident_rca.ai.prompt;

import com.myproject.incident_rca.model.Incident;
import org.springframework.stereotype.Component;

@Component
public class PromptBuilder {

    /*
     * Builds a structured prompt for AI analysis.
     * @param incident Incident entity
     * @return prompt string ready to send to AI
     */
    public String buildIncidentPrompt(Incident incident) {
        return """
               You are an SRE assistant helping engineers analyze production incidents.
               Be concise, factual, and avoid assumptions.
               If unsure, say so.

               Incident Details:
               Service: %s
               Severity: %s
               Error Message: %s
               Logs:
               %s

               Return the response in JSON format with the following fields:
               - summary
               - probable_root_cause
               - suggested_remediation
               - confidence_score (0-100)
               """.formatted(
                    incident.getServiceName(),
                    incident.getSeverity(),
                    incident.getErrorMessage(),
                    incident.getLogs()
                );
    }

}
