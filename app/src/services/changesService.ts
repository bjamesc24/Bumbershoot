// app/src/services/changesService.ts

export type ChangesResponse = {
  lastUpdated: string; // ISO 8601 timestamp
  version: number;     // monotonic version number
};

// Mock implementation
// Later: swap to real fetch using apiClient.ts when backend is ready.
const USE_MOCK = true;

// You can bump this number to simulate "server changed"
const MOCK_CHANGES: ChangesResponse = {
  lastUpdated: new Date().toISOString(),
  version: 1,
};

export async function getChanges(): Promise<ChangesResponse> {
  if (USE_MOCK) {
    // Simulate a tiny bit of network delay so UI timing is realistic
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_CHANGES;
  }

  // Placeholder for real implementation:
  // const res = await apiClient.get<ChangesResponse>("/changes");
  // return res.data;

  // If someone accidentally flips USE_MOCK off before backend exists:
  throw new Error("getChanges(): real /changes fetch not implemented yet");
}