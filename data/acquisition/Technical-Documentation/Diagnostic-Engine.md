# NutriAID — Diagnostic Engine Documentation

**FILE PATH:** NutriAID-Acquisition-Portal/Technical-Documentation/Diagnostic-Engine.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Diagnostic-Engine.pdf  
**Classification:** Confidential — Engineering Due Diligence

---

## Overview

The Diagnostic Engine is the admin-facing system for inspecting, testing, and validating the AI pipeline in real time. It consists of:

1. **AI Test Lab** — interactive test interface with four tabs
2. **Worker Diagnostic Panel** — per-worker configuration and live testing
3. **AI Logs Viewer** — complete trace of all orchestrator and worker events
4. **Admin Diagnose API** — programmatic access to worker diagnostics

---

## AI Test Lab

**Location:** Admin Console → AI Test Lab  
**URL:** `https://backend.nutriaid.eu/admin/ai-test-lab`

The AI Test Lab allows operators to run, inspect, and debug the AI pipeline without affecting production users.

### Tab 1: Chat

Simulates a full user guidance request:

- Input: natural language message (e.g., "Give me a high-protein meal plan avoiding gluten")
- Optional: override user profile (intolerances, allergies, goals)
- Output: complete AI response as the user would receive it
- Shows: intent detected, worker sequence used, total execution time

### Tab 2: Orchestrator

Full orchestration trace mode:

- Select intent manually (or auto-detect from message)
- Run the complete worker chain
- View **per-worker supervision report**:

```
Worker: meal-plan-generator
  Status: success (corrected)
  Schema valid: true
  Semantic valid: true
  Corrected: true
  Correction model: gpt-4o
  Errors before correction:
    - data.meals: missing required field
  Correction duration: 1,240ms
  Supervisor duration: 1,890ms
```

- View accumulated context passed to each worker
- View raw output vs. corrected output side by side

### Tab 3: Workers

Test individual workers in isolation:

- Select worker from dropdown
- Provide custom JSON input
- Execute the worker + supervision pipeline
- View:
  - Raw worker output
  - Supervision report (schema + semantic + safety results)
  - Correction applied (if any)
  - Final output

**Use case:** Verify that a specific worker behaves correctly after changing its custom prompt.

### Tab 4: Platform

Health check dashboard:

| Check | What it tests |
|---|---|
| AI API connectivity | Calls the configured primary model with a minimal test prompt |
| Database connectivity | Executes a lightweight PostgreSQL query |
| Email connectivity | Sends a test email to the configured admin address |
| Stripe connectivity | Validates the configured Stripe key |
| Frontend internal API | Calls the frontend internal endpoint with the sync secret |

Each check returns: `OK` / `FAIL` + error message + response time in ms.

---

## Worker Diagnostic Panel

**Location:** Admin Console → Settings → AI Brain → Workers tab

For each of the 10 workers:

| Control | Action |
|---|---|
| Enable/Disable toggle | Removes worker from all routing chains when disabled |
| Custom prompt textarea | Overrides built-in role description at runtime |
| Test button | Runs the worker in isolation with a sample input |
| View schema button | Shows the worker's expected output schema |

**Live diagnostic:** After changing a worker's prompt, operators can immediately run a test from this panel to verify the new prompt produces correct, schema-valid output.

---

## Admin Diagnose API

**Endpoint:** `POST /api/admin/workers/diagnose`  
**Auth:** Admin session required

**Request:**
```json
{
  "workerId": "meal-plan-generator",
  "input": {
    "sessionId": "test_session_001",
    "intent": "meal-plan",
    "profile": { "dietType": "gluten-free", "age": 35 },
    "intolerances": ["gluten", "lactose"],
    "allergies": []
  }
}
```

**Response:**
```json
{
  "workerId": "meal-plan-generator",
  "supervisionReport": {
    "worker": "meal-plan-generator",
    "finalOutput": { ... },
    "schemaValid": true,
    "semanticValid": true,
    "corrected": false,
    "correctionIncomplete": false,
    "errors": [],
    "correctionModel": null,
    "supervisorMs": 340
  },
  "totalMs": 2100
}
```

---

## AI Logs Viewer

**Location:** Admin Console → Logs  
**URL:** `https://backend.nutriaid.eu/admin/logs`

Displays all AI_Logs records with:

- Timestamp, session ID, user ID
- Log source (orchestrator / worker / ai / system)
- Log level (info / warning / error)
- Intent, worker, model
- Full input and output JSON (expandable)
- Error details (if any)

**Filters:**
- By log level
- By source
- By date range
- By session ID or user ID

**Retention:** 10,000 records (oldest pruned automatically on write)

---

## Test Generation API

**Endpoint:** `POST /api/admin/tests/generate`  
**Auth:** Admin session required

Generates a complete test scenario for any intent:

```json
// Request
{ "intent": "meal-plan", "lang": "en" }

// Response
{
  "testInput": {
    "userMessage": "Create a 5-day meal plan for me avoiding gluten and lactose",
    "profile": { "age": 30, "dietType": "omnivore", "activityLevel": "moderate" },
    "intolerances": ["gluten", "lactose"],
    "allergies": []
  },
  "expectedWorkerSequence": [
    "profile-analyzer", "intolerance-checker", "allergy-checker",
    "meal-plan-generator", "nutrition-calculator", "medical-safety"
  ]
}
```

---

## Monitoring Capabilities Summary

| Capability | Location | Detail Level |
|---|---|---|
| Live orchestration trace | AI Test Lab → Orchestrator | Per-worker, per-validation |
| Worker isolation test | AI Test Lab → Workers | Full supervision report |
| API health checks | AI Test Lab → Platform | Connectivity + latency |
| Full log history | Admin Logs | 10,000 records, searchable |
| Acquisition download tracking | Settings → Acquisition | Per-document, with IP + country |
| AI execution summary | Backend DB → aiLogs | Latest 1,000 executions |
| Security events | Backend DB → securityEvents | Login/session anomalies |
| Audit trail | Backend DB → auditEvents | All admin actions |

---

*NutriAID Acquisition Portal — Confidential — June 2026*
