CREATE TABLE rca_document (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL,

    problem_statement TEXT,
    business_impact TEXT,
    root_cause TEXT,
    resolution TEXT,
    preventive_actions TEXT,

    generated_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_rca_incident
        FOREIGN KEY (incident_id)
        REFERENCES incidents(id)
        ON DELETE CASCADE
);