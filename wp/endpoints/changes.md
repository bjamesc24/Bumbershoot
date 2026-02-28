## Changes Endpoint

### Endpoint
GET /changes

### Purpose
Returns version information so the app knows if it must refresh cached data.

### Response Example
{
  "lastUpdated": "2026-02-22T18:30:00Z",
  "version": 12
}

### App Behavior
- If version > local version → fetch full datasets
- If same → do nothing
- If request fails → use cached data