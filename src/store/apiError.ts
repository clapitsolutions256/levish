export function apiError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { error?: string } }).data;
    if (typeof data?.error === "string" && data.error) return data.error;
  }
  return fallback;
}
