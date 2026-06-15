# NutriAID — API Documentation

**FILE PATH:** NutriAID-Acquisition-Portal/Technical-Documentation/API-Documentation.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=API-Documentation.pdf  
**Classification:** Confidential — Engineering Due Diligence

---

## Overview

NutriAID exposes two distinct API surfaces:

- **Frontend API** (`https://nutriaid.eu/api/...`) — user-facing endpoints for authentication, guidance, monitoring, and account management
- **Backend Admin API** (`https://backend.nutriaid.eu/api/...`) — superadmin and platform management endpoints

Both surfaces are implemented as Next.js App Router Route Handlers. Authentication is JWT-based, stored in HttpOnly, Secure, SameSite=Strict cookies.

---

## Authentication Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/login` | POST | Authenticate and issue session cookie |
| `/api/auth/logout` | POST | Clear session cookie |
| `/api/auth/me` | GET | Return current session user |
| `/api/auth/verify-email` | POST | Verify email with token |
| `/api/auth/forgot-password` | POST | Send password reset email |
| `/api/auth/reset-password` | POST | Apply new password |
| `/api/auth/totp/setup` | POST | Initiate TOTP 2FA setup |
| `/api/auth/totp/verify` | POST | Verify TOTP code during setup |
| `/api/auth/totp/disable` | POST | Disable TOTP 2FA |

**Request — POST `/api/auth/login`:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "recaptchaToken": "03AGdBq..."
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "a1b2c3d4-...",
    "name": "Maria Ionescu",
    "email": "user@example.com",
    "plan": "pro",
    "verified": true
  }
}
```

**Session cookie:** `nutriaid-session`, HttpOnly, Secure, SameSite=Strict  
**reCAPTCHA:** All auth routes protected with reCAPTCHA v3 (score threshold configurable via admin)

---

## AI Guidance Endpoint

### POST `/api/guidance`

Executes the full AI orchestration pipeline for the authenticated user.

**Auth:** Session cookie required

**Request:**
```json
{
  "message": "Create a 5-day meal plan avoiding gluten and high-FODMAP foods",
  "lang": "en"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Here is your personalised 5-day meal plan...",
  "intent": "meal-plan",
  "workers": [
    { "worker": "profile-analyzer",    "status": "success", "corrected": false },
    { "worker": "intolerance-checker", "status": "success", "corrected": false },
    { "worker": "allergy-checker",     "status": "success", "corrected": false },
    { "worker": "meal-plan-generator", "status": "success", "corrected": true  },
    { "worker": "nutrition-calculator","status": "success", "corrected": false },
    { "worker": "medical-safety",      "status": "success", "corrected": false }
  ],
  "sessionId": "sess_abc123",
  "executionMs": 4820
}
```

**Pipeline:** Intent detection → ordered worker chain (each supervised) → context accumulation → natural language response generation.

**Rate limiting:** Configurable per-user limit via `MAX_REQUESTS_PER_HOUR` env variable.

---

## Monitoring Journal Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/monitoring` | GET | Fetch journal entries (paginated) |
| `/api/monitoring` | POST | Create new journal entry |
| `/api/monitoring/[id]` | PUT | Update an existing entry |
| `/api/monitoring/[id]` | DELETE | Delete a journal entry |
| `/api/monitoring/export` | GET | Export full journal as CSV |

**Entry structure:**
```json
{
  "id": "uuid",
  "date": "2026-06-12",
  "foods": ["oatmeal", "almond milk", "blueberries"],
  "kcal": 350,
  "symptoms": ["no symptoms"],
  "wellbeing": 8,
  "notes": "Good energy levels today",
  "createdAt": "2026-06-12T08:30:00Z"
}
```

---

## User Profile Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/profile` | GET | Return current user profile |
| `/api/profile` | PUT | Update profile fields |
| `/api/profile/intolerances` | PUT | Update intolerance list |
| `/api/profile/allergies` | PUT | Update allergy list |
| `/api/profile/goals` | PUT | Update nutritional goals |

---

## Subscription & Billing Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/stripe/create-checkout` | POST | Create Stripe Checkout session for plan upgrade |
| `/api/stripe/portal` | POST | Generate Stripe Customer Portal URL |
| `/api/stripe/webhook` | POST | Stripe webhook handler (HMAC-signed, no session auth) |

**Webhook events handled:**  
`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Acquisition Download Endpoint (Public)

### GET `/api/acquisition/download`

Tracks and serves acquisition portal documents.

**Query parameter:** `file=<filename>.pdf`

**Behaviour:**
1. Validates filename (basename only, known document, `.pdf` or `.md` extension)
2. Logs download: IP, country (Cloudflare `cf-ipcountry` header), user-agent, timestamp
3. Serves file as `application/pdf` with `Content-Disposition: attachment`
4. Falls back to `.md` if `.pdf` not present on disk

**Example:** `GET /api/acquisition/download?file=Executive-Summary.pdf`

---

## Internal API (Server-to-Server)

Internal endpoints require `Authorization: Bearer <INTERNAL_SYNC_SECRET>`.

### GET `/api/internal/acquisition/downloads`

Returns all acquisition download records and per-document statistics.

**Response:**
```json
{
  "downloads": [
    {
      "id": "uuid",
      "timestamp": "2026-06-12T10:22:00Z",
      "ip": "85.123.45.67",
      "country": "RO",
      "userAgent": "Mozilla/5.0...",
      "file": "Executive-Summary.pdf",
      "subfolder": "Executive-and-Product-Reports"
    }
  ],
  "stats": {
    "Executive-Summary.pdf": 47,
    "Valuation-Report.pdf": 31
  },
  "total": 234
}
```

---

## Backend Admin API

All backend admin endpoints require an active superadmin session cookie (`nutriaid-admin-session`).

### AI Management

| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/settings/ai-brain` | GET/PUT | Read/update AI Brain configuration |
| `/api/admin/workers/diagnose` | POST | Run a worker in isolation with full supervision report |
| `/api/admin/tests/generate` | POST | Generate a test scenario for a given intent |

### User Management

| Endpoint | Method | Description |
|---|---|---|
| `/api/superadmin/users` | GET | List all users (paginated, filterable) |
| `/api/superadmin/users/[id]` | GET | User detail with subscription history |
| `/api/superadmin/users/[id]` | PUT | Update user flags (blocked, verified, plan) |
| `/api/superadmin/users/[id]/sessions` | DELETE | Invalidate all sessions for a user |

### Platform Operations

| Endpoint | Method | Description |
|---|---|---|
| `/api/superadmin/acquisition/downloads` | GET | Proxy acquisition download log from frontend |
| `/api/superadmin/sync-password` | POST | Sync superadmin password to frontend visitor account |

---

## Standardised Error Format

All endpoints return structured errors:

```json
{
  "error": "Descriptive error message",
  "code": "VALIDATION_ERROR",
  "details": { "field": "email", "issue": "Invalid format" }
}
```

**HTTP Status Codes:**

| Code | Meaning |
|---|---|
| 400 | Invalid request / validation error |
| 401 | Not authenticated |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error (details not exposed) |

---

## Security Headers

All responses include:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```

---

*NutriAID Acquisition Portal — Confidential — June 2026*
