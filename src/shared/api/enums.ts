import type {
  AucTypeDto,
  AuctionStatusDto,
  BodyTypeDto,
  RoutePointKindDto,
  TradingStatusDto,
} from './dto';

export const AUC_TYPE = {
  Request: 'Request',
  Up: 'Up',
  Down: 'Down',
  FixPrice: 'FixPrice',
} as const satisfies Record<AucTypeDto, AucTypeDto>;

export const AUCTION_STATUS = {
  Draft: 'Draft',
  Published: 'Published',
  Trading: 'Trading',
  Finished: 'Finished',
  Cancelled: 'Cancelled',
} as const satisfies Record<AuctionStatusDto, AuctionStatusDto>;

export const TRADING_STATUS = {
  None: 'None',
  Leading: 'Leading',
  Losing: 'Losing',
  Winner: 'Winner',
  Loser: 'Loser',
} as const satisfies Record<TradingStatusDto, TradingStatusDto>;

export const BODY_TYPE = {
  Tent: 'Tent',
  Refrigerator: 'Refrigerator',
  Isotherm: 'Isotherm',
  Van: 'Van',
  OpenBody: 'OpenBody',
  Container: 'Container',
} as const satisfies Record<BodyTypeDto, BodyTypeDto>;

export const ROUTE_POINT_KIND = {
  Load: 'Load',
  Unload: 'Unload',
} as const satisfies Record<RoutePointKindDto, RoutePointKindDto>;

export const AUC_TYPE_VALUES = Object.values(AUC_TYPE);
export const AUCTION_STATUS_VALUES = Object.values(AUCTION_STATUS);
export const TRADING_STATUS_VALUES = Object.values(TRADING_STATUS);
export const BODY_TYPE_VALUES = Object.values(BODY_TYPE);
