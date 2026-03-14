const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://example.com/wp-json";

export const USE_SAMPLE_DATA =
  process.env.EXPO_PUBLIC_USE_SAMPLE_DATA === "false" ? false : true;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
};

function deepClone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function getSampleData(path: string): any {
  const cleanPath = path.split("?")[0];

  switch (cleanPath) {
    case "/changes":
      return require("../sample-data/changes.sample.json");

    case "/announcements":
      return require("../sample-data/announcements.sample.json");

    case "/music":
      return require("../sample-data/music.sample.json");

    case "/art":
      return require("../sample-data/art.sample.json");

    case "/vendors":
      return require("../sample-data/vendors.sample.json");

    case "/venues":
      return require("../sample-data/venues.sample.json");

    case "/locations":
      return require("../sample-data/locations.sample.json");

    case "/districts":
      return require("../sample-data/districts.sample.json");

    case "/favorites":
      return require("../sample-data/favorites.sample.json");

    case "/reminders":
      return require("../sample-data/reminders.sample.json");

    case "/myPlan":
      return require("../sample-data/myPlan.sample.json");

    default:
      throw new Error(`[sampleData] No sample-data mapping found for path: ${path}`);
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (USE_SAMPLE_DATA && (options.method ?? "GET") === "GET") {
    const sample = getSampleData(path);
    return deepClone(sample) as T;
  }

  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}

export const apiClient = {
  baseUrl: BASE_URL,
  useSampleData: USE_SAMPLE_DATA,
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body }),
};