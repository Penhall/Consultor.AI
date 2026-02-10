# API Contract: Admin

## GET /api/admin/stats

Get daily platform metrics for the admin dashboard.

**Auth**: Required (admin only)
**Query Parameters**:

- `days` (optional, default: 7): Number of days of history to return (max 30)

**Response 200**:

```json
{
  "stats": [
    {
      "date": "2026-02-08",
      "totalViews": 1250,
      "prevDayViewsChangePercent": "+12",
      "userCount": 85,
      "paidUserCount": 12,
      "userDelta": 3,
      "paidUserDelta": 1,
      "totalRevenue": 1234.0,
      "totalProfit": 987.0,
      "sources": [
        { "name": "google", "visitors": 450 },
        { "name": "direct", "visitors": 320 }
      ]
    }
  ]
}
```

**Response 401**: `{ "error": "Authentication required" }`
**Response 403**: `{ "error": "Admin access required" }`

---

## GET /api/admin/users

List all platform users with pagination and filters.

**Auth**: Required (admin only)
**Query Parameters**:

- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10, max: 50): Users per page
- `email` (optional): Email filter (partial match, case-insensitive)
- `subscriptionStatus` (optional): Comma-separated statuses (`active,past_due,deleted,cancel_at_period_end`)
- `isAdmin` (optional): Boolean filter (`true` or `false`)

**Response 200**:

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "maria@example.com",
      "name": "Maria Silva",
      "subscriptionPlan": "pro",
      "subscriptionStatus": "active",
      "stripeCustomerId": "cus_xxx",
      "credits": 185,
      "isAdmin": false,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 85,
    "totalPages": 9
  }
}
```

**Response 401**: `{ "error": "Authentication required" }`
**Response 403**: `{ "error": "Admin access required" }`

---

## PATCH /api/admin/users

Update a user's admin status.

**Auth**: Required (admin only)
**Request Body**:

```json
{
  "userId": "uuid",
  "isAdmin": true
}
```

**Response 200**:

```json
{
  "userId": "uuid",
  "isAdmin": true,
  "updatedAt": "2026-02-08T12:00:00Z"
}
```

**Response 400**: `{ "error": "Cannot modify your own admin status" }`
**Response 401**: `{ "error": "Authentication required" }`
**Response 403**: `{ "error": "Admin access required" }`
**Response 404**: `{ "error": "User not found" }`
