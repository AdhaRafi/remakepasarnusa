import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      ...(details !== undefined ? { details } : {}),
    },
    { status }
  );
}

export function handleApiError(err: unknown, defaultMessage = "Terjadi kesalahan pada server.") {
  console.error("API Error:", err);
  const message = err instanceof Error ? err.message : defaultMessage;
  return apiError(message || defaultMessage, 500);
}
