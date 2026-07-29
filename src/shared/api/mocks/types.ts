import type { AuctionDetailDto, BetDto } from '../dto';

export interface MockAuctionRecord {
  detail: AuctionDetailDto;
  bets: BetDto[];
  startPrice: number | null;
}
