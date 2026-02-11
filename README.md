# AI-Assisted Incident Analysis & RCA System

## Overview
Production incidents often involve large volumes of unstructured data such as logs and error messages. Engineers spend significant time analyzing incidents, identifying root causes, and drafting post-incident RCA documents.

This project is an AI-assisted incident analysis system that helps engineers analyze incidents, capture validated resolutions, and generate RCA drafts.

**Key Principle:**  
AI assists analysis; humans own accountability.

## Key Features
- Incident creation and storage
- Incident history with basic filtering
- On-demand AI-assisted analysis (summary, probable cause, remediation)
- Human-validated root cause and resolution
- Automated RCA draft generation

## Design Principles
- Human-in-the-loop AI
- Auditability and traceability
- Clear ownership of decisions
- Production-oriented data modeling

## Architecture
This system is implemented as a monolithic Spring Boot application with a simple frontend.

See [docs/architecture.md] for details.

## Tech Stack
- Java 17
- Spring Boot
- PostgreSQL
- Google Gemini API (free tier)
- Frontend: TBD (React or Thymeleaf)

## Limitations / Non-Goals
- No authentication or role-based access
- No real-time alerting
- No auto-remediation
- AI output is advisory only
- This system does not replace existing incident management tools

## Success Criteria (MVP)
The MVP is considered complete when:
- Incidents can be created and stored
- AI analysis can be triggered and saved
- Engineers can submit validated resolutions
- RCA drafts can be generated from resolved incidents
- The system runs end-to-end on a free-tier deployment

## Future Enhancements
- Incident similarity detection
- RCA export (PDF)
- Basic authentication
