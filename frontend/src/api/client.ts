export const engineUrl = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function errorMessage(data: unknown) {
  return data && typeof data === "object" && "error" in data && typeof data.error === "string"
    ? data.error
    : "Request failed";
}

async function requestJson<T>(path: string, method: "GET" | "POST" | "PATCH", body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${engineUrl}${path}`, {
      method,
      signal,
      cache: "no-store",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError("Engine unreachable", 0);
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError(response.ok ? "Request failed" : "Engine unreachable", response.ok ? 500 : response.status);
  }

  if (!response.ok) throw new ApiError(errorMessage(data), response.status);
  return data as T;
}

export function getJson<T>(path: string, signal?: AbortSignal) {
  return requestJson<T>(path, "GET", undefined, signal);
}

export function sendJson<T>(path: string, method: "POST" | "PATCH", body: unknown, signal?: AbortSignal) {
  return requestJson<T>(path, method, body, signal);
}
