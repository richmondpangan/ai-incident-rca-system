# AI-Assisted Incident Analysis & RCA System

## Overview

Production incidents often involve large volumes of unstructured data such as logs and error messages. Engineers spend significant time analyzing incidents, identifying root causes, and manually drafting post-incident RCA (Root Cause Analysis) documents.

This project is a **full-stack AI-assisted incident management system** that helps engineers:

- Analyze incidents using AI
- Capture **human-validated root causes and resolutions**
- Generate structured RCA drafts from real-world data

---

## Key Features

### Incident Management
- Create and store incidents with logs and metadata
- View incident history with filtering and pagination

### AI-Assisted Analysis
- On-demand AI analysis using Google Gemini API (free tier)
- Generates:
    - Summary
    - Probable root cause
    - Suggested remediation
    - Confidence score
- AI output is stored for traceability and auditing

### Human Resolution Workflow
- Engineers submit:
    - Final root cause
    - Resolution steps
- Enforces lifecycle: **OPEN → RESOLVED**
- Separates AI suggestions from human-validated truth

### RCA Draft Generation
- Generates structured RCA documents:
    - Problem Statement
    - Business Impact
    - Root Cause
    - Resolution
    - Preventive Actions
- Based on **validated engineer input**, not AI assumptions

---

## Design Principles

- **Human-in-the-loop AI** — AI assists, never replaces decisions
- **Auditability & traceability** — AI outputs are stored separately
- **Clear ownership** — Engineers provide final, authoritative data
- **Production-oriented design** — Realistic workflows and lifecycle

---

## Architecture

This system is implemented as a **monolithic full-stack application**:

- **Backend:** Spring Boot REST API
- **Frontend:** React (Vite)
- **Database:** PostgreSQL
- **AI Integration:** Google Gemini API

---

## Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Data JPA
- Flyway (database migrations)

### Frontend
- React (Vite)
- Axios
- Tailwind CSS (optional UI styling)

### Infrastructure
- PostgreSQL
- Docker (local development)
- Free-tier hosting (Render / Vercel)

### AI
- Google Gemini API (free tier)

---

## System Workflow

1. System receives an incident → stored as **OPEN**
2. AI analysis is triggered (optional)
3. Engineer investigates and submits **validated resolution**
4. Incident becomes **RESOLVED**
5. RCA draft is generated from validated data
