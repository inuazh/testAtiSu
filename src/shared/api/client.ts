import type { ErrorDto, ValidationErrorItemDto, ValidationErrorResponseDto } from './dto';

export const API_BASE_URL = '/api';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isErrorDto(value: unknown): value is ErrorDto {
  return isRecord(value) && typeof value.code === 'string' && typeof value.message === 'string';
}

function isValidationErrorResponse(value: unknown): value is ValidationErrorResponseDto {
  if (!isRecord(value) || !Array.isArray(value.detail)) {
    return false;
  }

  return value.detail.every(
    (item) =>
      isRecord(item) &&
      Array.isArray(item.loc) &&
      typeof item.msg === 'string' &&
      typeof item.type === 'string',
  );
}

export function getValidationDetail(error: unknown): ValidationErrorItemDto[] | null {
  if (!(error instanceof ApiError) || error.status !== 422) {
    return null;
  }

  return isValidationErrorResponse(error.body) ? error.body.detail : null;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const detail = getValidationDetail(error);

    if (detail && detail.length > 0) {
      return detail.map((item) => item.msg).join('; ');
    }

    if (isErrorDto(error.body)) {
      return error.body.message;
    }
  }

  return error instanceof Error ? error.message : 'Неизвестная ошибка';
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text === '') {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  signal?: AbortSignal | undefined;
}

function resolveUrl(path: string): string {
  const relative = `${API_BASE_URL}${path}`;

  return typeof window === 'undefined'
    ? relative
    : new URL(relative, window.location.origin).toString();
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = 'GET', body, signal } = options;

  const init: RequestInit = { method, signal: signal ?? null };

  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }

  const response = await fetch(resolveUrl(path), init);

  const parsed = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, parsed, `${method} ${path} → ${response.status}`);
  }

  return parsed as TResponse;
}
