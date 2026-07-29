import type { AuctionListFiltersDto, AuctionListRequestDto } from '@/shared/api';
import type { AuctionSearch } from '../model/searchParams';

export function buildListRequest(search: AuctionSearch): AuctionListRequestDto {
  const filters: AuctionListFiltersDto = {};

  if (search.cargo_num !== undefined) {
    filters.cargo_num = search.cargo_num;
  }

  if (search.status !== undefined) {
    filters.status = search.status;
  }

  if (search.statuses !== undefined) {
    filters.statuses = search.statuses;
  }

  if (search.auc_type !== undefined) {
    filters.auc_type = search.auc_type;
  }

  if (search.load_city !== undefined) {
    filters.load_city = search.load_city;
  }

  if (search.unload_city !== undefined) {
    filters.unload_city = search.unload_city;
  }

  if (search.load_date_from !== undefined) {
    filters.load_date_from = search.load_date_from;
  }

  if (search.load_date_to !== undefined) {
    filters.load_date_to = search.load_date_to;
  }

  if (search.is_available !== undefined) {
    filters.is_available = search.is_available;
  }

  if (search.is_bidder !== undefined) {
    filters.is_bidder = search.is_bidder;
  }

  if (search.price_from !== undefined) {
    filters.price_from = search.price_from;
  }

  if (search.price_to !== undefined) {
    filters.price_to = search.price_to;
  }

  const request: AuctionListRequestDto = {
    page: search.page,
    limit: search.limit,
  };

  if (Object.keys(filters).length > 0) {
    request.filters = filters;
  }

  return request;
}
