import {UsageResponse} from "./types";

const API_BASE_URL = "https://twitter.bark.gg";

export async function fetchUsage(apiKey: string): Promise<UsageResponse> {
  const response = await fetch(`${API_BASE_URL}/usage`, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid API key");
    }
    if (response.status === 403) {
      throw new Error("Access denied");
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
