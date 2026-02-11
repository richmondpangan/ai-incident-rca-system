CREATE TABLE ai_analysis (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    summary TEXT,
    probable_root_cause TEXT,
    suggested_remediation TEXT,
    confidence_score INT CHECK (confidence_score BETWEEN 0 AND 100),
    raw_response TEXT,
    model_name VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_analysis_incident_id
    ON ai_analysis (incident_id);

CREATE INDEX idx_ai_analysis_created_at
    ON ai_analysis (created_at);