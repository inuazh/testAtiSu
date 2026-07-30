import type {
  AuctionStatusDto,
  AuctionTypeDto,
  BidMeasurementTypeDto,
  OperationTypeDto,
  PaymentDelayTypeDto,
  TradingStatusDto,
} from '@/shared/api';
import {
  AUCTION_STATUS,
  AUCTION_TYPE,
  BID_MEASUREMENT_TYPE,
  OPERATION_TYPE,
  PAYMENT_DELAY_TYPE,
  TRADING_STATUS,
} from '@/shared/api';

export const UNKNOWN_LABEL = 'Не указано';

export const AUCTION_TYPE_LABELS: Record<AuctionTypeDto, string> = {
  [AUCTION_TYPE.Request]: 'Заявочный',
  [AUCTION_TYPE.Up]: 'На повышение',
  [AUCTION_TYPE.Down]: 'На понижение',
  [AUCTION_TYPE.FixPrice]: 'Фиксированная цена',
  [AUCTION_TYPE.Unknown]: UNKNOWN_LABEL,
};

export const AUCTION_STATUS_LABELS: Record<AuctionStatusDto, string> = {
  [AUCTION_STATUS.Planning]: 'Планирование',
  [AUCTION_STATUS.Auction]: 'Идут торги',
  [AUCTION_STATUS.DeterminateWinner]: 'Определение победителя',
  [AUCTION_STATUS.WaitDeal]: 'Ожидание сделки',
  [AUCTION_STATUS.InProgress]: 'В работе',
  [AUCTION_STATUS.Finished]: 'Завершён',
  [AUCTION_STATUS.Stopped]: 'Остановлен',
  [AUCTION_STATUS.Canceled]: 'Отменён',
  [AUCTION_STATUS.Unknown]: UNKNOWN_LABEL,
};

export const TRADING_STATUS_LABELS: Record<TradingStatusDto, string> = {
  [TRADING_STATUS.NotParticipating]: 'Не участвую',
  [TRADING_STATUS.Leading]: 'Лидирую',
  [TRADING_STATUS.Losing]: 'Перебит',
  [TRADING_STATUS.OnPending]: 'На рассмотрении',
  [TRADING_STATUS.Confirmed]: 'Подтверждён',
  [TRADING_STATUS.ChoosingWinner]: 'Выбор победителя',
  [TRADING_STATUS.Winner]: 'Победитель',
  [TRADING_STATUS.Accepted]: 'Принят',
  [TRADING_STATUS.Unknown]: UNKNOWN_LABEL,
};

export const BID_MEASUREMENT_TYPE_LABELS: Record<NonNullable<BidMeasurementTypeDto>, string> = {
  [BID_MEASUREMENT_TYPE.PerRoute]: 'За рейс',
  [BID_MEASUREMENT_TYPE.PerKm]: 'За км',
  [BID_MEASUREMENT_TYPE.Unknown]: UNKNOWN_LABEL,
};

export const OPERATION_TYPE_LABELS: Record<OperationTypeDto, string> = {
  [OPERATION_TYPE.Loading]: 'Погрузка',
  [OPERATION_TYPE.Unloading]: 'Выгрузка',
  [OPERATION_TYPE.Unknown]: UNKNOWN_LABEL,
};

export const PAYMENT_DELAY_TYPE_LABELS: Record<NonNullable<PaymentDelayTypeDto>, string> = {
  [PAYMENT_DELAY_TYPE.CalendarDays]: 'календарных дн.',
  [PAYMENT_DELAY_TYPE.WorkDays]: 'рабочих дн.',
  [PAYMENT_DELAY_TYPE.Unknown]: 'дн.',
};

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const AUCTION_STATUS_TONES: Record<AuctionStatusDto, BadgeTone> = {
  [AUCTION_STATUS.Planning]: 'neutral',
  [AUCTION_STATUS.Auction]: 'success',
  [AUCTION_STATUS.DeterminateWinner]: 'info',
  [AUCTION_STATUS.WaitDeal]: 'info',
  [AUCTION_STATUS.InProgress]: 'info',
  [AUCTION_STATUS.Finished]: 'neutral',
  [AUCTION_STATUS.Stopped]: 'warning',
  [AUCTION_STATUS.Canceled]: 'danger',
  [AUCTION_STATUS.Unknown]: 'neutral',
};

export const TRADING_STATUS_TONES: Record<TradingStatusDto, BadgeTone> = {
  [TRADING_STATUS.NotParticipating]: 'neutral',
  [TRADING_STATUS.Leading]: 'success',
  [TRADING_STATUS.Losing]: 'warning',
  [TRADING_STATUS.OnPending]: 'info',
  [TRADING_STATUS.Confirmed]: 'success',
  [TRADING_STATUS.ChoosingWinner]: 'info',
  [TRADING_STATUS.Winner]: 'success',
  [TRADING_STATUS.Accepted]: 'success',
  [TRADING_STATUS.Unknown]: 'neutral',
};

export function resolveLabel<T extends string>(
  labels: Record<T, string>,
  value: T | null | undefined,
): string {
  if (value === null || value === undefined) {
    return UNKNOWN_LABEL;
  }

  return Object.hasOwn(labels, value) ? labels[value] : UNKNOWN_LABEL;
}

export function resolveTone<T extends string>(
  tones: Record<T, BadgeTone>,
  value: T | null | undefined,
): BadgeTone {
  if (value === null || value === undefined) {
    return 'neutral';
  }

  return Object.hasOwn(tones, value) ? tones[value] : 'neutral';
}
