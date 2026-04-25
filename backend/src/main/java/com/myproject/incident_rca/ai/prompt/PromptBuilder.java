package com.myproject.incident_rca.ai.prompt;

import com.myproject.incident_rca.model.AIAnalysis;
import com.myproject.incident_rca.model.Incident;
import com.myproject.incident_rca.model.IncidentResolution;
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

    public String buildRCAPrompt(Incident incident,
                                 IncidentResolution resolution,
                                 AIAnalysis aiAnalysis) {

        return """
                You are a senior Site Reliability Engineer writing a formal Root Cause Analysis (RCA).
                
                Base your answer primarily on the engineer's confirmed root cause and resolution.
                Use AI analysis only as supporting context.
                
                Be precise, factual, and professional.
                Do not invent details.
                
                Incident Details:
                Service: %s
                Severity: %s
                Error Message: %s
                
                Logs:
                %s
                
                Engineer Findings:
                Final Root Cause:
                %s
                
                Resolution Steps:
                %s
                
                AI Analysis (Optional):
                Summary: %s
                Probable Root Cause: %s
                Suggested Fix: %s
                
                Return STRICT JSON:
                
                {
                  "problem_statement": "...",
                  "business_impact": "...",
                  "root_cause": "...",
                  "resolution": "...",
                  "preventive_actions": "..."
                }
                """.formatted(
                incident.getServiceName(),
                incident.getSeverity(),
                incident.getErrorMessage(),
                incident.getLogs(),

                resolution.getFinalRootCause(),
                resolution.getResolutionSteps(),

                aiAnalysis != null ? aiAnalysis.getSummary() : "N/A",
                aiAnalysis != null ? aiAnalysis.getProbableRootCause() : "N/A",
                aiAnalysis != null ? aiAnalysis.getSuggestedRemediation() : "N/A"
        );
    }
}