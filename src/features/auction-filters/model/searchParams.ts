import { z } from 'zod';
import { AUC_TYPE, AUCTION_STATUS } from '@/shared/api';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const optionalText = z.string().trim().min(1).optional().catch(undefined);

const optionalDate = z.string().regex(ISO_DATE).optional().catch(undefined);

const optionalBoolean = z
  .union([z.boolean(), z.literal('true'), z.literal('false')])
  .transform((value) => value === true || value === 'true')
  .optional()
  .catch(undefined);

const optionalPrice = z.coerce.number().finite().nonnegative().optional().catch(undefined);

const statusList = z
  .union([
    z.array(z.enum(AUCTION_STATUS)),
    z
      .string()
      .transform((value) => value.split(','))
      .pipe(z.array(z.enum(AUCTION_STATUS))),
  ])
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional()
  .catch(undefined);

export const auctionSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).catch(DEFAULT_LIMIT),
  cargo_num: optionalText,
  status: z.enum(AUCTION_STATUS).optional().catch(undefined),
  statuses: statusList,
  auc_type: z.enum(AUC_TYPE).optional().catch(undefined),
  load_city: optionalText,
  unload_city: optionalText,
  load_date_from: optionalDate,
  load_date_to: optionalDate,
  is_available: optionalBoolean,
  is_bidder: optionalBoolean,
  price_from: optionalPrice,
  price_to: optionalPrice,
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
  'price_from',
  'price_to',
] as const satisfies readonly (keyof AuctionSearch)[];

export function countActiveFilters(search: AuctionSearch): number {
  return FILTER_KEYS.filter((key) => search[key] !== undefined).length;
}

export function clearFilters(search: AuctionSearch): AuctionSearch {
  return { page: DEFAULT_PAGE, limit: search.limit };
}
