import { z } from "zod";

export class ApiError extends Error {
  status?: number;
  path?: string;

  constructor(message: string, opts?: { status?: number; path?: string }) {
    super(message);
    this.name = "ApiError";
    if (opts?.status !== undefined) {
      this.status = opts.status;
    }
    if (opts?.path !== undefined) {
      this.path = opts.path;
    }
  }
}

const environmentSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:8000")
});

const env = environmentSchema.parse({
  NEXT_PUBLIC_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000"
});

export function getApiBaseUrl() {
  return env.NEXT_PUBLIC_API_BASE_URL;
}

export async function apiGetJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, { cache: "no-store" });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : `GET ${path} failed (network error)`,
      { path }
    );
  }

  if (!response.ok) {
    throw new ApiError(`GET ${path} failed with ${response.status}`, { status: response.status, path });
  }

  return response.json() as Promise<T>;
}

export async function apiPostJson<TResponse, TBody extends object>(
  path: string,
  body: TBody
): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : `POST ${path} failed (network error)`,
      { path }
    );
  }

  if (!response.ok) {
    throw new ApiError(`POST ${path} failed with ${response.status}`, { status: response.status, path });
  }

  return response.json() as Promise<TResponse>;
}
