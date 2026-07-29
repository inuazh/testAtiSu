import type {
  AucTypeDto,
  AuctionStatusDto,
  BodyTypeDto,
  RoutePointKindDto,
  TradingStatusDto,
} from '@/shared/api';
import {
  AUC_TYPE,
  AUCTION_STATUS,
  BODY_TYPE,
  ROUTE_POINT_KIND,
  TRADING_STATUS,
} from '@/shared/api';

export const AUC_TYPE_LABELS: Record<AucTypeDto, string> = {
  [AUC_TYPE.Request]: 'Запрос цены',
  [AUC_TYPE.Up]: 'На повышение',
  [AUC_TYPE.Down]: 'На понижение',
  [AUC_TYPE.FixPrice]: 'Фиксированная цена',
};

export const AUCTION_STATUS_LABELS: Record<AuctionStatusDto, string> = {
  [AUCTION_STATUS.Draft]: 'Черновик',
  [AUCTION_STATUS.Published]: 'Опубликован',
  [AUCTION_STATUS.Trading]: 'Идут торги',
  [AUCTION_STATUS.Finished]: 'Завершён',
  [AUCTION_STATUS.Cancelled]: 'Отменён',
};

export const TRADING_STATUS_LABELS: Record<TradingStatusDto, string> = {
  [TRADING_STATUS.None]: 'Не участвую',
  [TRADING_STATUS.Leading]: 'Лидирую',
  [TRADING_STATUS.Losing]: 'Проигрываю',
  [TRADING_STATUS.Winner]: 'Победитель',
  [TRADING_STATUS.Loser]: 'Не выиграл',
};

export const BODY_TYPE_LABELS: Record<BodyTypeDto, string> = {
  [BODY_TYPE.Tent]: 'Тент',
  [BODY_TYPE.Refrigerator]: 'Рефрижератор',
  [BODY_TYPE.Isotherm]: 'Изотерм',
  [BODY_TYPE.Van]: 'Фургон',
  [BODY_TYPE.OpenBody]: 'Открытый кузов',
  [BODY_TYPE.Container]: 'Контейнер',
};

export const ROUTE_POINT_KIND_LABELS: Record<RoutePointKindDto, string> = {
  [ROUTE_POINT_KIND.Load]: 'Погрузка',
  [ROUTE_POINT_KIND.Unload]: 'Выгрузка',
};

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const AUCTION_STATUS_TONES: Record<AuctionStatusDto, BadgeTone> = {
  [AUCTION_STATUS.Draft]: 'neutral',
  [AUCTION_STATUS.Published]: 'info',
  [AUCTION_STATUS.Trading]: 'success',
  [AUCTION_STATUS.Finished]: 'neutral',
  [AUCTION_STATUS.Cancelled]: 'danger',
};

export const TRADING_STATUS_TONES: Record<TradingStatusDto, BadgeTone> = {
  [TRADING_STATUS.None]: 'neutral',
  [TRADING_STATUS.Leading]: 'success',
  [TRADING_STATUS.Losing]: 'warning',
  [TRADING_STATUS.Winner]: 'success',
  [TRADING_STATUS.Loser]: 'danger',
};
