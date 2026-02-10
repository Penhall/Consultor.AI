# API Contract: Files

## GET /api/files

List all files for the authenticated user.

**Auth**: Required
**Response 200**:

```json
{
  "files": [
    {
      "id": "uuid",
      "name": "tabela-precos-2026.pdf",
      "type": "application/pdf",
      "sizeBytes": 524288,
      "createdAt": "2026-02-08T10:00:00Z"
    }
  ]
}
```

**Response 401**: `{ "error": "Authentication required" }`

---

## POST /api/files

Create a presigned upload URL for a new file.

**Auth**: Required
**Request Body**:

```json
{
  "name": "tabela-precos-2026.pdf",
  "type": "application/pdf",
  "sizeBytes": 524288
}
```

**Response 200**:

```json
{
  "fileId": "uuid",
  "uploadUrl": "https://storage.supabase.co/...",
  "storageKey": "consultant_files/uuid/tabela-precos-2026.pdf"
}
```

**Response 400**: `{ "error": "Invalid file type. Allowed: PDF, PNG, JPG, WEBP" }`
**Response 400**: `{ "error": "File size exceeds 10MB limit" }`
**Response 401**: `{ "error": "Authentication required" }`

---

## GET /api/files/[id]

Get a presigned download URL for a specific file.

**Auth**: Required (owner only via RLS)
**Response 200**:

```json
{
  "downloadUrl": "https://storage.supabase.co/...",
  "expiresIn": 3600
}
```

**Response 401**: `{ "error": "Authentication required" }`
**Response 404**: `{ "error": "File not found" }`

---

## DELETE /api/files/[id]

Delete a file from storage and database.

**Auth**: Required (owner only via RLS)
**Response 204**: File deleted successfully

**Response 401**: `{ "error": "Authentication required" }`
**Response 404**: `{ "error": "File not found" }`
