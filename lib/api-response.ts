import { NextResponse } from "next/server";

export type ApiErrorBody = { error: string; code?: string; details?: unknown };

export function apiError(
  message: string,
  status: number,
  options?: { code?: string; headers?: HeadersInit }
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { error: message };
  if (options?.code) body.code = options.code;
  return NextResponse.json(body, {
    status,
    headers: options?.headers,
  });
}

export function apiValidationError(
  message: string,
  details?: Record<string, string[] | undefined>
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { error: message, code: "VALIDATION_ERROR" };
  if (details) body.details = details;
  return NextResponse.json(body, { status: 400 });
}
