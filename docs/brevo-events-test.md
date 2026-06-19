# Brevo Events — Test Commands

## Manual curl test (via debug endpoint)

Replace `<INTERNAL_TOKEN>` with the value from admin → Settings → Internal Email Token.

```bash
# Test user_logged_in event
curl -X POST https://nutriaid.eu/api/internal/brevo-events/test \
  -H "Authorization: Bearer <INTERNAL_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"event":"user_logged_in","email":"test@example.com","properties":{"ip":"1.2.3.4"}}'

# Test ai_chat_used event
curl -X POST https://nutriaid.eu/api/internal/brevo-events/test \
  -H "Authorization: Bearer <INTERNAL_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"event":"ai_chat_used","email":"test@example.com","properties":{"intent":"guidance","latencyMs":1200}}'

# Test subscription_started event
curl -X POST https://nutriaid.eu/api/internal/brevo-events/test \
  -H "Authorization: Bearer <INTERNAL_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"event":"subscription_started","email":"test@example.com","properties":{"plan":"pro","provider":"stripe"}}'
```

## Brevo Events API — Spec

| Field | Value |
|-------|-------|
| Endpoint | `POST https://in-automate.brevo.com/api/v2/trackEvent` |
| Auth Header | `ma-key: <automation_key>` (**NOT** `api-key`) |
| Content-Type | `application/json` |
| Payload | `{ "event": "...", "email": "...", "properties": {...} }` |

> **Note**: The Automation key (`ma-key`) is different from the Contacts API key (`api-key`).
> Find it in: Brevo → Automations → Settings → Tracking Code → "Client key"

## Event map

| Event | Trigger |
|-------|---------|
| `user_logged_in` | POST `/api/auth/login` — success |
| `ai_chat_used` | POST `/api/guidance` — after AI response |
| `meal_plan_generated` | POST `/api/guidance` — when mealExamples present |
| `food_scan` | POST `/api/monitoring` — food entry logged |
| `daily_checkin` | POST `/api/monitoring` — any monitoring entry |
| `weight_logged` | PATCH `/api/profile` — when weightKg updated |
| `onboarding_step_completed` | PATCH `/api/profile` — when onboardingCompleted=true |
| `subscription_started` | Stripe webhook `checkout.session.completed` |
| `subscription_upgraded` | Stripe webhook `customer.subscription.updated` (plan up) |
| `subscription_downgraded` | Stripe webhook `customer.subscription.updated` (plan down) |
| `subscription_canceled` | Stripe webhook `customer.subscription.deleted` |
