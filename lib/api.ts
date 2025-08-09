export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

export const CREATE_CONVERSATION_ENDPOINT_PATH = "/v1/conversation"
export const CONTINUE_CONVERSATION_ENDPOINT_PATH = "/v1/conversation/continue"

export function resolveApiUrl(path: string): string {
  if (!API_BASE_URL) return path
  try {
    return new URL(path, API_BASE_URL).toString()
  } catch {
    return path
  }
}
