import { z } from "zod";

const environmentSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:8000")
});

const env = environmentSchema.parse({
  NEXT_PUBLIC_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
});

export function getApiBaseUrl() {
  return env.NEXT_PUBLIC_API_BASE_URL;
}
