# API Contract: Billing

## POST /api/billing/checkout

Create a Stripe Checkout Session for subscription or credit purchase.

**Auth**: Required
**Request Body**:

```json
{
  "planId": "pro" | "agencia" | "credits50"
}
```

**Response 200**:

```json
{
  "sessionUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

**Response 401**: `{ "error": "Authentication required" }`
**Response 403**: `{ "error": "User needs an email to make a payment" }`
**Response 400**: `{ "error": "Invalid plan ID" }`

---

## GET /api/billing/portal

Get Stripe Customer Portal URL for subscription management.

**Auth**: Required
**Response 200**:

```json
{
  "portalUrl": "https://billing.stripe.com/session/..."
}
```

**Response 200** (no subscription):

```json
{
  "portalUrl": null
}
```

---

## POST /api/billing/webhook

Stripe webhook handler. Receives raw body for signature verification.

**Auth**: None (Stripe signature validation)
**Headers**: `stripe-signature: t=...,v1=...`
**Request Body**: Raw Stripe event payload

**Response 200**: `{ "received": true }` — Event processed successfully
**Response 200**: `{ "received": true }` — Unknown user event (logged, acknowledged to prevent Stripe retries)
**Response 400**: `{ "error": "Invalid signature" }`

**Events handled**:

- `invoice.paid` → Update subscription or add credits
- `customer.subscription.updated` → Update subscription status
- `customer.subscription.deleted` → Mark subscription as deleted

**Edge cases**:

- Webhook for unknown user: Log error, return 200 (prevent Stripe retries)
- Re-subscription within same period: Update status to active, do not duplicate credits

---

## GET /api/billing/credits

Get current user's credit balance and plan info.

**Auth**: Required
**Response 200**:

```json
{
  "credits": 15,
  "purchasedCredits": 0,
  "monthlyAllocation": 20,
  "subscriptionPlan": "freemium",
  "subscriptionStatus": null,
  "creditsResetAt": "2026-03-01T00:00:00Z"
}
```
