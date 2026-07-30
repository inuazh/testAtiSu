import type { AuctionListRequestDto } from '@/shared/api';
import type { AuctionSearch } from '../model/searchParams';

export function buildListRequest(search: AuctionSearch): AuctionListRequestDto {
  const request: AuctionListRequestDto = {
    page: search.page,
    per_page: search.per_page,
  };

  if (search.cargo_num !== undefined) {
    request.cargo_num = search.cargo_num;
  }

  if (search.status !== undefined) {
    request.status = [...search.status];
  }

  if (search.statuses !== undefined) {
    request.statuses = [...search.statuses];
  }

  if (search.auc_type !== undefined) {
    request.auc_type = [...search.auc_type];
  }

  if (search.load_city !== undefined) {
    request.load_city = search.load_city;
  }

  if (search.unload_city !== undefined) {
    request.unload_city = search.unload_city;
  }

  if (search.load_date_from !== undefined) {
    request.load_date_from = search.load_date_from;
  }

  if (search.load_date_to !== undefined) {
    request.load_date_to = search.load_date_to;
  }

  if (search.is_available !== undefined) {
    request.is_available = search.is_available;
  }

  if (search.is_bidder !== undefined) {
    request.is_bidder = search.is_bidder;
  }

  if (search.current_price_from !== undefined) {
    request.current_price_from = search.current_price_from;
  }

  if (search.current_price_to !== undefined) {
    request.current_price_to = search.current_price_to;
  }

  return request;
}
