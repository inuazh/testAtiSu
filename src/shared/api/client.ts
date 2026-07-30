import type { ProblemDetailDto, ValidationErrorDto, ValidationProblemDto } from './dto';

export const API_BASE_URL = '/api/v1';

export const HTTP_STATUS = {
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  ValidationFailed: 422,
  ServiceUnavailable: 503,
} as const;

const STATUS_MESSAGES: Record<number, string> = {
  [HTTP_STATUS.Unauthorized]: 'Сессия истекла или токен недействителен. Войдите заново.',
  [HTTP_STATUS.NotFound]: 'Ресурс не найден.',
  [HTTP_STATUS.ServiceUnavailable]:
    'Сервис временно недоступен. Попробуйте повторить запрос через минуту.',
};

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

function isProblemDetail(value: unknown): value is ProblemDetailDto {
  return isRecord(value) && typeof value.message === 'string';
}

function isValidationProblem(value: unknown): value is ValidationProblemDto {
  if (!isRecord(value) || !Array.isArray(value.errors)) {
    return false;
  }

  return value.errors.every(
    (item) => isRecord(item) && typeof item.field === 'string' && typeof item.message === 'string',
  );
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === HTTP_STATUS.Unauthorized;
}

export function isServiceUnavailable(error: unknown): boolean {
  return error instanceof ApiError && error.status === HTTP_STATUS.ServiceUnavailable;
}

export function getValidationErrors(error: unknown): ValidationErrorDto[] | null {
  if (!(error instanceof ApiError) || error.status !== HTTP_STATUS.ValidationFailed) {
    return null;
  }

  return isValidationProblem(error.body) ? (error.body.errors ?? []) : null;
}

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : 'Неизвестная ошибка';
  }

  const statusMessage = STATUS_MESSAGES[error.status];

  if (statusMessage !== undefined) {
    return statusMessage;
  }

  const validationErrors = getValidationErrors(error);

  if (validationErrors !== null && validationErrors.length > 0) {
    return validationErrors.map((item) => item.message).join('; ');
  }

  if (isProblemDetail(error.body) && error.body.message !== undefined) {
    return error.body.message;
  }

  return `Запрос завершился ошибкой ${error.status}`;
}

export function isRetriableError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return true;
  }

  return error.status >= 500;
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
