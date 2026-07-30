import { queryOptions } from '@tanstack/react-query';
import type { AuctionListItemDto, AuctionListRequestDto } from '@/shared/api';
import { auctionKeys, getAuctionBets, getAuctionDetail, getAuctionsList } from '@/shared/api';
import { mapAuctionDetail, mapAuctionList } from '../lib/mapAuction';

export function auctionUuidOf(item: AuctionListItemDto): string {
  return item.main?.order_uid ?? '';
}

export function auctionListQueryOptions(request: AuctionListRequestDto) {
  return queryOptions({
    queryKey: auctionKeys.list(request),
    queryFn: ({ signal }) => getAuctionsList(request, signal),
    select: (data) => mapAuctionList(data, auctionUuidOf),
  });
}

export function auctionDetailQueryOptions(auctionUuid: string) {
  return queryOptions({
    queryKey: auctionKeys.detail(auctionUuid),
    queryFn: ({ signal }) => getAuctionDetail(auctionUuid, signal),
    select: (data) => mapAuctionDetail(data, auctionUuid),
  });
}

export function auctionBetsQueryOptions(auctionUuid: string) {
  return queryOptions({
    queryKey: auctionKeys.bets(auctionUuid),
    queryFn: ({ signal }) => getAuctionBets(auctionUuid, signal),
  });
}
