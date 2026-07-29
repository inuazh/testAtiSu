import type { AuctionListRequestDto } from './dto';

export const auctionKeys = {
  root: ['auctions'] as const,
  lists: () => [...auctionKeys.root, 'list'] as const,
  list: (request: AuctionListRequestDto) => [...auctionKeys.lists(), request] as const,
  details: () => [...auctionKeys.root, 'detail'] as const,
  detail: (auctionUuid: string) => [...auctionKeys.details(), auctionUuid] as const,
  bets: (auctionUuid: string) => [...auctionKeys.detail(auctionUuid), 'bets'] as const,
};
