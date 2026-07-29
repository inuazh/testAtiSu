import type { AucTypeDto, BetDto, CarrierDto } from '../dto';
import { AUC_TYPE, AUCTION_STATUS, TRADING_STATUS } from '../enums';
import { roundTo } from './random';
import type { MockAuctionRecord } from './types';

export const VAT_RATE = 0.2;

export const CURRENT_CARRIER: CarrierDto = {
  uuid: '00000000-0000-4000-8000-00000000c0de',
  name: 'ООО «Мой Перевозчик»',
  inn: '7701234567',
};

export function toPriceWithoutVat(priceWithVat: number): number {
  return Math.round(priceWithVat / (1 + VAT_RATE));
}

export function toPriceWithVat(priceWithoutVat: number): number {
  return Math.round(priceWithoutVat * (1 + VAT_RATE));
}

export function isLowerBetter(aucType: AucTypeDto): boolean {
  return aucType === AUC_TYPE.Down || aucType === AUC_TYPE.Request;
}

function compareBets(a: BetDto, b: BetDto, aucType: AucTypeDto): number {
  if (a.price_with_vat !== b.price_with_vat) {
    return isLowerBetter(aucType)
      ? a.price_with_vat - b.price_with_vat
      : b.price_with_vat - a.price_with_vat;
  }

  return Date.parse(a.created_at) - Date.parse(b.created_at);
}

export function recalculate(record: MockAuctionRecord): void {
  const { detail } = record;
  const active = record.bets.filter((bet) => !bet.is_cancelled);

  active.sort((a, b) => compareBets(a, b, detail.auc_type));

  const isFinished = detail.status === AUCTION_STATUS.Finished;

  for (const bet of record.bets) {
    bet.rank = bet.is_cancelled ? 0 : active.indexOf(bet) + 1;
    bet.is_winner = isFinished && bet.rank === 1;
  }

  const best = active[0];
  detail.trading.current_price = best ? best.price_with_vat : record.startPrice;

  const myBet = active.find((bet) => bet.is_my === true);
  detail.trading.has_my_bet = myBet !== undefined;
  detail.trading.my_bet_price = myBet ? myBet.price_with_vat : null;

  if (!myBet) {
    detail.trading.trading_status = TRADING_STATUS.None;
  } else if (isFinished) {
    detail.trading.trading_status = myBet.rank === 1 ? TRADING_STATUS.Winner : TRADING_STATUS.Loser;
  } else {
    detail.trading.trading_status =
      myBet.rank === 1 ? TRADING_STATUS.Leading : TRADING_STATUS.Losing;
  }

  applyPriceBounds(record);
}

export function applyPriceBounds(record: MockAuctionRecord): void {
  const { trading, auc_type: aucType } = record.detail;
  const current = trading.current_price;

  if (current === null || aucType === AUC_TYPE.Request) {
    trading.min = null;
    trading.max = null;
    trading.available_price = null;
    return;
  }

  if (aucType === AUC_TYPE.FixPrice) {
    trading.min = current;
    trading.max = current;
    trading.available_price = current;
    return;
  }

  const start = record.startPrice ?? current;
  const floor = roundTo(start * 0.5, 500);
  const ceiling = roundTo(start * 2, 500);
  const step = trading.step ?? 0;

  if (aucType === AUC_TYPE.Down) {
    const available = Math.max(current - step, floor);
    trading.min = floor;
    trading.max = available;
    trading.available_price = available;
    return;
  }

  const available = Math.min(current + step, ceiling);
  trading.min = available;
  trading.max = ceiling;
  trading.available_price = available;
}
