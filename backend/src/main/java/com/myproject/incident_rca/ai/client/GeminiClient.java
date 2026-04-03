package com.myproject.incident_rca.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myproject.incident_rca.ai.config.GeminiProperties;
import com.myproject.incident_rca.exception.GeminiApiException;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Component
public class GeminiClient {

    private final WebClient webClient;
    private final GeminiProperties properties;

    public GeminiClient (GeminiProperties properties) {
        this.properties = properties;
        this.webClient = WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .build();
        // TEMPORARY FOR DEBUGGING
        /*System.out.println("Gemini API Key loaded: " +
                (properties.getApiKey() != null && !properties.getApiKey().isBlank()));
        System.out.println("Base URL: " + properties.getBaseUrl());
        System.out.println("Model: " + properties.getModel());
        System.out.println("Timeout: " + properties.getTimeoutSeconds());
        */
    }

    public String analyze(String prompt) {
        try {
            String rawResponse = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/{model}:generateContent")
                            .queryParam("key", properties.getApiKey())
                            .build(properties.getModel()))
                    .bodyValue(buildRequest(prompt))
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                    .block();

            //System.out.println("===== RAW GEMINI RESPONSE =====");
            //System.out.println(rawResponse);

            String extracted = extractText(rawResponse);

            //System.out.println("===== EXTRACTED TEXT =====");
            //System.out.println(extracted);

            String cleaned = cleanJson(extracted);

            //System.out.println("===== CLEANED JSON =====");
            //System.out.println(cleaned);

            return cleaned;

        } catch (Exception ex) {
            throw new GeminiApiException("Gemini API call failed", ex);
        }
    }

    private String extractText(String rawJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(rawJson);

            return root
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (Exception e) {
            throw new RuntimeException("Failed to extract Gemini text", e);
        }
    }

    private String cleanJson(String text) {

        // Remove markdown
        text = text.replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();

        // Extract only JSON part
        int start = text.indexOf("{");
        int end = text.lastIndexOf("}");

        if (start != -1 && end != -1) {
            return text.substring(start, end + 1);
        }

        return text;
    }

    private Object buildRequest(String prompt) {
        return new Object() {
            public final Object[] contents = new Object[] {
                    new Object() {
                        public final Object[] parts = new Object[] {
                                new Object() {
                                    public final String text = prompt;
                                }
                        };
                    }
            };
        };
    }

}
