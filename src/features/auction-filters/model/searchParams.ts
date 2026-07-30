import { z } from 'zod';
import {
  AUCTION_STATUS_CODE_VALUES,
  AUCTION_TYPE_FILTER_VALUES,
  TRADING_STATUS,
} from '@/shared/api';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 100;

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(([+-]\d{2}:\d{2})|Z)$/;

const optionalText = z.string().trim().min(1).optional().catch(undefined);

const optionalDateTime = z.string().regex(ISO_DATE_TIME).optional().catch(undefined);

const optionalBoolean = z
  .union([z.boolean(), z.literal('true'), z.literal('false')])
  .transform((value) => value === true || value === 'true')
  .optional()
  .catch(undefined);

const optionalPrice = z.coerce.number().finite().nonnegative().optional().catch(undefined);

function listOf<T extends z.ZodTypeAny>(item: T, parse: (raw: string) => unknown) {
  return z
    .union([
      z.array(item),
      z
        .string()
        .transform((value) => value.split(',').map(parse))
        .pipe(z.array(item)),
      item.transform((value) => [value]),
    ])
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional()
    .catch(undefined);
}

const tradingStatusList = listOf(z.enum(TRADING_STATUS), (raw) => raw);
const auctionStatusCodeList = listOf(
  z.union(AUCTION_STATUS_CODE_VALUES.map((code) => z.literal(code))),
  (raw) => Number(raw),
);
const auctionTypeList = listOf(
  z.union(AUCTION_TYPE_FILTER_VALUES.map((value) => z.literal(value))),
  (raw) => raw,
);

export const auctionSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(DEFAULT_PAGE),
  per_page: z.coerce.number().int().min(1).max(MAX_PER_PAGE).catch(DEFAULT_PER_PAGE),
  cargo_num: optionalText,
  status: tradingStatusList,
  statuses: auctionStatusCodeList,
  auc_type: auctionTypeList,
  load_city: optionalText,
  unload_city: optionalText,
  load_date_from: optionalDateTime,
  load_date_to: optionalDateTime,
  is_available: optionalBoolean,
  is_bidder: optionalBoolean,
  current_price_from: optionalPrice,
  current_price_to: optionalPrice,
});

export type AuctionSearch = z.infer<typeof auctionSearchSchema>;

export function parseAuctionSearch(input: unknown): AuctionSearch {
  return auctionSearchSchema.parse(input ?? {});
}

const FILTER_KEYS = [
  'cargo_num',
  'status',
  'statuses',
  'auc_type',
  'load_city',
  'unload_city',
  'load_date_from',
  'load_date_to',
  'is_available',
  'is_bidder',
  'current_price_from',
  'current_price_to',
] as const satisfies readonly (keyof AuctionSearch)[];

export function countActiveFilters(search: AuctionSearch): number {
  return FILTER_KEYS.filter((key) => search[key] !== undefined).length;
}

export function clearFilters(search: AuctionSearch): AuctionSearch {
  return { page: DEFAULT_PAGE, per_page: search.per_page };
}

export function toDateInputValue(value: string | undefined): string {
  return value === undefined ? '' : value.slice(0, 10);
}

export function fromDateInputValue(value: string, endOfDay: boolean): string | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  return `${value}T${endOfDay ? '23:59:59' : '00:00:00'}Z`;
}
