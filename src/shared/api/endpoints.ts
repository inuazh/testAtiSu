import { apiRequest } from './client';
import type {
  AuctionDetailDto,
  AuctionListRequestDto,
  AuctionListResponseDto,
  BetsResponseDto,
  CreateBetRequestDto,
  CreateBetResponseDto,
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
): Promise<AuctionDetailDto> {
  return apiRequest<AuctionDetailDto>(`/auctions/${auctionUuid}`, { signal });
}

export function getAuctionBets(
  auctionUuid: string,
  signal?: AbortSignal,
): Promise<BetsResponseDto> {
  return apiRequest<BetsResponseDto>(`/auctions/${auctionUuid}/bets`, { signal });
}

export function createBet(
  auctionUuid: string,
  request: CreateBetRequestDto,
): Promise<CreateBetResponseDto> {
  return apiRequest<CreateBetResponseDto>(`/auctions/${auctionUuid}/bets`, {
    method: 'POST',
    body: request,
  });
}
