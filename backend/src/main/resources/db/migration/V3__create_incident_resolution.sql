CREATE TABLE incident_resolution (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL UNIQUE,
    final_root_cause TEXT NOT NULL,
    resolution_steps TEXT NOT NULL,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_incident
        FOREIGN KEY (incident_id)
        REFERENCES incidents(id)
        ON DELETE CASCADE
);