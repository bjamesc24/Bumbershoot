## Change Check Rules 

This section defines the behavior for the initial implementation of the change-check system.

### 1. Minimum Check Interval

- The app must not perform `/changes` checks more frequently than once every 15 minutes while the app is active.
- The interval is measured using a locally stored timestamp of the last successful change check.
- The interval value will be defined in code as a constant.

### 2. Single Request In Flight

- The app must ensure that only one `/changes` request is active at a time.
- If a change check is already running, additional triggers must be ignored.
- This prevents duplicate network calls and race conditions.

### 3. Failure Handling

- If the `/changes` request fails (network error, timeout, etc.):
  - The app must continue using cached data.
  - The app must not crash.
  - The failure may trigger a non-blocking warning (e.g., offline banner).
- No automatic retry loop should be implemented in Week 1.

### 4. Timestamp & Version Storage

The following values must be stored locally:

- `lastChangeCheckAt` (number, milliseconds since epoch)
- `remoteVersion` (number returned from `/changes`)
- `lastUpdated` (ISO timestamp from `/changes`)

These values are used to determine whether a refresh is required and to display the last updated time in the UI.