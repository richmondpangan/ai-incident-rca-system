package com.myproject.incident_rca.ai.client;

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
            return webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/{model}:generateContent")
                            .queryParam("key", properties.getApiKey())
                            .build(properties.getModel()))
                    .bodyValue(buildRequest(prompt))
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                    .block();
        } catch (Exception ex) {
            throw new GeminiApiException("Gemini API call failed", ex);
        }
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
