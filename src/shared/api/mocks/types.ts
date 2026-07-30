import type {
  AuctionStatusDto,
  AuctionTypeDto,
  BetItemDto,
  BidMeasurementTypeDto,
  ContactDto,
  OperationTypeDto,
  PaymentDelayTypeDto,
  TradingStatusDto,
} from '../dto';
import type { AuctionStatusCode } from '../enums';

export interface MockRoutePoint {
  rowNum: number;
  opType: OperationTypeDto;
  startDate: string;
  endDate: string;
  comment: string | null;
  contractor: string;
  contractorInn: string;
  cityName: string;
  cityFullName: string;
  cityGcId: number;
  loadingAddress: string;
  lon: number;
  lat: number;
  cargoName: string;
  packageName: string;
  weight: number;
  volume: number;
  contactName: string;
  contactPhone: string;
}

export interface MockOrganization {
  subscriberId: number;
  subscriberCode: string;
  infobaseCode: string;
  id: number;
  name: string;
  inn: string;
  kpp: string;
  isHide: boolean;
}

export interface MockAuction {
  id: number;
  uuid: string;
  cargoNum: string;
  cargoDate: string;
  orderUid: string;
  createdAt: string;
  aucType: AuctionTypeDto;
  status: AuctionStatusDto;
  statusCode: AuctionStatusCode | null;
  startTime: string;
  stopTime: string;
  bidMeasurementType: BidMeasurementTypeDto;
  canSetBet: boolean;
  allowCounterBets: boolean;
  hideBetsHistory: boolean;
  hidePlaces: boolean;
  noViewCargoPrice: boolean;
  hidePointsAddressAndContacts: boolean;
  isFavorite: boolean;
  organization: MockOrganization;
  contacts: ContactDto[];
  points: MockRoutePoint[];
  cargoPrice: number;
  bodyType: string;
  truckCount: number;
  isInternational: boolean;
  containered: boolean;
  tempFrom: number | null;
  tempTo: number | null;
  paymentForm: string;
  paymentCondition: string | null;
  paymentDelay: number | null;
  paymentDelayType: PaymentDelayTypeDto;
  currencyCode: string;
  distance: number;
  startPrice: number;
  step: number | null;
  bets: BetItemDto[];
  currentPrice: number | null;
  tradingStatus: TradingStatusDto;
}
