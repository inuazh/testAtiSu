import type {
  AuctionStatusDto,
  AuctionTypeDto,
  BidMeasurementTypeDto,
  OperationTypeDto,
  PaymentDelayTypeDto,
  TradingStatusDto,
} from './dto';

export const AUCTION_TYPE = {
  Request: 'Request',
  Up: 'Up',
  Down: 'Down',
  FixPrice: 'FixPrice',
  Unknown: 'Unknown',
} as const satisfies Record<AuctionTypeDto, AuctionTypeDto>;

export const AUCTION_STATUS = {
  Planning: 'Planning',
  Auction: 'Auction',
  DeterminateWinner: 'DeterminateWinner',
  WaitDeal: 'WaitDeal',
  InProgress: 'InProgress',
  Finished: 'Finished',
  Stopped: 'Stopped',
  Canceled: 'Canceled',
  Unknown: 'Unknown',
} as const satisfies Record<AuctionStatusDto, AuctionStatusDto>;

export const TRADING_STATUS = {
  NotParticipating: 'NotParticipating',
  Leading: 'Leading',
  Losing: 'Losing',
  OnPending: 'OnPending',
  Confirmed: 'Confirmed',
  ChoosingWinner: 'ChoosingWinner',
  Winner: 'Winner',
  Accepted: 'Accepted',
  Unknown: 'Unknown',
} as const satisfies Record<TradingStatusDto, TradingStatusDto>;

export const BID_MEASUREMENT_TYPE = {
  PerRoute: 'PerRoute',
  PerKm: 'PerKm',
  Unknown: 'Unknown',
} as const satisfies Record<NonNullable<BidMeasurementTypeDto>, NonNullable<BidMeasurementTypeDto>>;

export const OPERATION_TYPE = {
  Loading: 'Loading',
  Unloading: 'Unloading',
  Unknown: 'Unknown',
} as const satisfies Record<OperationTypeDto, OperationTypeDto>;

export const PAYMENT_DELAY_TYPE = {
  CalendarDays: 'CalendarDays',
  WorkDays: 'WorkDays',
  Unknown: 'Unknown',
} as const satisfies Record<NonNullable<PaymentDelayTypeDto>, NonNullable<PaymentDelayTypeDto>>;

export const AUCTION_STATUS_CODE = {
  Planning: 1,
  Auction: 2,
  DeterminateWinner: 3,
  WaitDeal: 4,
  InProgress: 5,
  Finished: 6,
  Stopped: 7,
} as const;

export type AuctionStatusCode = (typeof AUCTION_STATUS_CODE)[keyof typeof AUCTION_STATUS_CODE];

export const AUCTION_STATUS_BY_CODE: Record<AuctionStatusCode, AuctionStatusDto> = {
  [AUCTION_STATUS_CODE.Planning]: AUCTION_STATUS.Planning,
  [AUCTION_STATUS_CODE.Auction]: AUCTION_STATUS.Auction,
  [AUCTION_STATUS_CODE.DeterminateWinner]: AUCTION_STATUS.DeterminateWinner,
  [AUCTION_STATUS_CODE.WaitDeal]: AUCTION_STATUS.WaitDeal,
  [AUCTION_STATUS_CODE.InProgress]: AUCTION_STATUS.InProgress,
  [AUCTION_STATUS_CODE.Finished]: AUCTION_STATUS.Finished,
  [AUCTION_STATUS_CODE.Stopped]: AUCTION_STATUS.Stopped,
};

export const AUCTION_TYPE_VALUES = Object.values(AUCTION_TYPE);
export const AUCTION_STATUS_VALUES = Object.values(AUCTION_STATUS);
export const TRADING_STATUS_VALUES = Object.values(TRADING_STATUS);
export const AUCTION_STATUS_CODE_VALUES = Object.values(AUCTION_STATUS_CODE);

export const AUCTION_TYPE_FILTER_VALUES = [
  AUCTION_TYPE.Request,
  AUCTION_TYPE.Up,
  AUCTION_TYPE.Down,
  AUCTION_TYPE.FixPrice,
] as const satisfies readonly AuctionTypeDto[];

export type AuctionTypeFilterValue = (typeof AUCTION_TYPE_FILTER_VALUES)[number];
