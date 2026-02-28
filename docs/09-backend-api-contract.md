# Backend API Contract

This document defines the API contract between the mobile app and the backend (WordPress REST endpoints). It specifies endpoint paths, expected response formats, and app behavior rules for offline-first caching and refresh.

## Conventions

### Base URL
- The app will call endpoints using a configured API base URL (e.g., from environment config).
- Exact deployment URL will vary per environment (dev/staging/prod).

### Data Formats
- All responses are JSON.
- All timestamps are ISO 8601 (UTC preferred), e.g. `2026-02-22T18:30:00Z`.
- IDs are stable and should not change once published.

### Error Handling Expectations
- The app must gracefully handle network failures and continue using cached data whenever possible.
- Endpoints should return appropriate HTTP status codes and error messages.

---

## GET /changes

### Endpoint Path
GET /changes

### Purpose
Provides lightweight version information so the mobile app can determine whether cached datasets must be refreshed. This endpoint minimizes network usage by avoiding full dataset downloads when no data has changed. :contentReference[oaicite:1]{index=1}

### Response Example
```json
{
  "lastUpdated": "2026-02-22T18:30:00Z",
  "version": 12
}