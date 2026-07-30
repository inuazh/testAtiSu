import { apiRequest } from './client';
import type {
  AuctionListRequestDto,
  AuctionListResponseDto,
  AuctionShowResponseDto,
  BetListResponseDto,
  SetBetRequestDto,
} from './dto';

export function getAuctionsList(
  request: AuctionListRequestDto,
  signal?: AbortSignal,
): Promise<AuctionListResponseDto> {
  return apiRequest<AuctionListResponseDto>('/auctions/list', {
    method: 'POST',
    body: request,
    signal,
  });
}

export function getAuctionDetail(
  auctionUuid: string,
  signal?: AbortSignal,
): Promise<AuctionShowResponseDto> {
  return apiRequest<AuctionShowResponseDto>(`/auctions/${auctionUuid}`, { signal });
}

export function getAuctionBets(
  auctionUuid: string,
  signal?: AbortSignal,
): Promise<BetListResponseDto> {
  return apiRequest<BetListResponseDto>(`/auctions/${auctionUuid}/bets`, { signal });
}

export function setBet(auctionUuid: string, request: SetBetRequestDto): Promise<unknown> {
  return apiRequest<unknown>(`/auctions/${auctionUuid}/bets`, {
    method: 'POST',
    body: request,
  });
}
