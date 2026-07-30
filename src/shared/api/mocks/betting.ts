import type { AuctionTypeDto, BetItemDto } from '../dto';
import { AUCTION_STATUS, AUCTION_TYPE, TRADING_STATUS } from '../enums';
import { roundTo } from './random';
import type { MockAuction, MockOrganization } from './types';

export const VAT_RATE = 0.2;

export const CURRENT_ORGANIZATION: MockOrganization = {
  subscriberId: 900001,
  subscriberCode: 'SUB-900001',
  infobaseCode: 'IB-01',
  id: 770001,
  name: 'ООО «Мой Перевозчик»',
  inn: '7701234567',
  kpp: '770101001',
  isHide: false,
};

export function toPriceNoVat(priceWithVat: number): number {
  return Math.round(priceWithVat / (1 + VAT_RATE));
}

export function isLowerBetter(aucType: AuctionTypeDto): boolean {
  return aucType === AUCTION_TYPE.Down || aucType === AUCTION_TYPE.Request;
}

function betPrice(bet: BetItemDto): number {
  return bet.price_with_vat ?? 0;
}

function compareBets(a: BetItemDto, b: BetItemDto, aucType: AuctionTypeDto): number {
  if (betPrice(a) !== betPrice(b)) {
    return isLowerBetter(aucType) ? betPrice(a) - betPrice(b) : betPrice(b) - betPrice(a);
  }

  return Date.parse(a.created_at ?? '') - Date.parse(b.created_at ?? '');
}

export function isOwnBet(bet: BetItemDto): boolean {
  return bet.organization_id === CURRENT_ORGANIZATION.id;
}

export function recalculate(auction: MockAuction): void {
  const active = auction.bets.filter((bet) => bet.is_rejected !== true);

  active.sort((a, b) => compareBets(a, b, auction.aucType));

  const isFinished =
    auction.status === AUCTION_STATUS.Finished || auction.status === AUCTION_STATUS.InProgress;

  for (const bet of auction.bets) {
    const place = active.indexOf(bet) + 1;
    bet.place = bet.is_rejected === true ? null : place;
    bet.is_win = isFinished && place === 1 && bet.is_rejected !== true;
  }

  const best = active[0];
  auction.currentPrice = best ? betPrice(best) : auction.startPrice;

  const ownBet = active.find(isOwnBet);

  if (!ownBet) {
    auction.tradingStatus = TRADING_STATUS.NotParticipating;
    return;
  }

  if (isFinished) {
    auction.tradingStatus = ownBet.place === 1 ? TRADING_STATUS.Winner : TRADING_STATUS.Losing;
    return;
  }

  auction.tradingStatus = ownBet.place === 1 ? TRADING_STATUS.Leading : TRADING_STATUS.Losing;
}

export interface PriceBounds {
  available: number | null;
  min: number | null;
  max: number | null;
}

export function priceBounds(auction: MockAuction): PriceBounds {
  const current = auction.currentPrice;

  if (current === null || auction.aucType === AUCTION_TYPE.Request) {
    return { available: null, min: null, max: null };
  }

  if (auction.aucType === AUCTION_TYPE.FixPrice) {
    return { available: current, min: current, max: current };
  }

  const step = auction.step ?? 0;
  const floor = roundTo(auction.startPrice * 0.5, 500);
  const ceiling = roundTo(auction.startPrice * 2, 500);

  if (auction.aucType === AUCTION_TYPE.Down) {
    const available = Math.max(current - step, floor);

    return { available, min: floor, max: available };
  }

  const available = Math.min(current + step, ceiling);

  return { available, min: available, max: ceiling };
}

export function ownActiveBet(auction: MockAuction): BetItemDto | undefined {
  return auction.bets.find((bet) => bet.is_rejected !== true && isOwnBet(bet));
}
