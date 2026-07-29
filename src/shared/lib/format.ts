export const EMPTY_VALUE = '—';

const priceFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

type Nullable = number | null | undefined;

export function formatPrice(value: Nullable): string {
  return value === null || value === undefined ? EMPTY_VALUE : `${priceFormatter.format(value)} ₽`;
}

export function formatPricePerKm(value: Nullable): string {
  return value === null || value === undefined
    ? EMPTY_VALUE
    : `${decimalFormatter.format(value)} ₽/км`;
}

export function formatWeight(value: Nullable): string {
  return value === null || value === undefined
    ? EMPTY_VALUE
    : `${decimalFormatter.format(value)} т`;
}

export function formatVolume(value: Nullable): string {
  return value === null || value === undefined
    ? EMPTY_VALUE
    : `${decimalFormatter.format(value)} м³`;
}

export function formatDistance(value: Nullable): string {
  return value === null || value === undefined ? EMPTY_VALUE : `${priceFormatter.format(value)} км`;
}

export function formatNumber(value: Nullable): string {
  return value === null || value === undefined ? EMPTY_VALUE : priceFormatter.format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return EMPTY_VALUE;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? EMPTY_VALUE : dateFormatter.format(parsed);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return EMPTY_VALUE;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? EMPTY_VALUE : dateTimeFormatter.format(parsed);
}

export function formatText(value: string | null | undefined): string {
  return value === null || value === undefined || value.trim() === '' ? EMPTY_VALUE : value;
}
