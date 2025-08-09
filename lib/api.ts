export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

export const SEND_MESSAGE_ENDPOINT_PATH = "/api/mock"

export function resolveApiUrl(path: string): string {
  if (!API_BASE_URL) return path
  try {
    return new URL(path, API_BASE_URL).toString()
  } catch {
    return path
  }
}
