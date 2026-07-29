import { queryOptions } from '@tanstack/react-query';
import type { AuctionListRequestDto } from '@/shared/api';
import { auctionKeys, getAuctionBets, getAuctionDetail, getAuctionsList } from '@/shared/api';
import { mapAuctionDetail, mapAuctionList, mapBets } from '../lib/mapAuction';

export function auctionListQueryOptions(request: AuctionListRequestDto) {
  return queryOptions({
    queryKey: auctionKeys.list(request),
    queryFn: ({ signal }) => getAuctionsList(request, signal),
    select: mapAuctionList,
  });
}

export function auctionDetailQueryOptions(auctionUuid: string) {
  return queryOptions({
    queryKey: auctionKeys.detail(auctionUuid),
    queryFn: ({ signal }) => getAuctionDetail(auctionUuid, signal),
    select: mapAuctionDetail,
  });
}

export function auctionBetsQueryOptions(auctionUuid: string) {
  return queryOptions({
    queryKey: auctionKeys.bets(auctionUuid),
    queryFn: ({ signal }) => getAuctionBets(auctionUuid, signal),
    select: mapBets,
  });
}
