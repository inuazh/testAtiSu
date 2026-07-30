import type { BadgeTone } from '../lib/labels';

export const PRIMARY_ACTION = {
  CreateBet: 'create_bet',
  EditBet: 'edit_bet',
  ViewBets: 'view_bets',
  Unavailable: 'unavailable',
} as const;

export type PrimaryActionKind = (typeof PRIMARY_ACTION)[keyof typeof PRIMARY_ACTION];

export interface PrimaryActionVm {
  kind: PrimaryActionKind;
  label: string;
  disabled: boolean;
}

export interface PriceLimits {
  current: number | null;
  available: number | null;
  min: number | null;
  max: number | null;
  step: number | null;
}

export interface PricePairVm {
  withVat: string;
  noVat: string;
}

export interface TradingVm {
  canSetBet: boolean;
  statusLabel: string;
  statusTone: BadgeTone;
  auctionStatusLabel: string;
  auctionStatusTone: BadgeTone;
  bidMeasurementLabel: string;
  startTime: string;
  stopTime: string;
  currentPrice: PricePairVm;
  availablePrice: PricePairVm;
  minPrice: PricePairVm;
  maxPrice: PricePairVm;
  step: PricePairVm;
  pricePerKm: string;
  hasMyBet: boolean;
  myBetWithVat: string;
  myBetNoVat: string;
  isWinner: boolean;
  limits: PriceLimits;
}

export interface RestrictionsVm {
  hideBetsHistory: boolean;
  hidePlaces: boolean;
  hidePointsAddressAndContacts: boolean;
  noViewCargoPrice: boolean;
}

export interface AuctionListItemVm {
  uuid: string;
  id: number | null;
  cargoNum: string;
  aucTypeLabel: string;
  statusLabel: string;
  statusTone: BadgeTone;
  tradingStatusLabel: string;
  tradingStatusTone: BadgeTone;
  routeFrom: string;
  routeTo: string;
  loadDate: string;
  unloadDate: string;
  cargoName: string;
  cargoWeight: string;
  cargoVolume: string;
  bodyType: string;
  currentPrice: string;
  currentPriceNoVat: string;
  pricePerKm: string;
  hasMyBet: boolean;
  myBetPrice: string;
  canSetBet: boolean;
  organizationName: string;
  organizationHidden: boolean;
  primaryAction: PrimaryActionVm;
}

export interface AuctionListVm {
  items: AuctionListItemVm[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface RoutePointVm {
  key: string;
  opTypeLabel: string;
  cityName: string;
  cityFullName: string;
  address: string;
  addressHidden: boolean;
  startDate: string;
  endDate: string;
  comment: string;
  contractor: string;
  cargoName: string;
  packageName: string;
  weight: string;
  volume: string;
  contactName: string;
  contactPhone: string;
}

export interface OrganizerVm {
  name: string;
  inn: string;
  kpp: string;
  subscriberCode: string;
}

export interface ContactVm {
  key: string;
  name: string;
  phone: string;
  workPhone: string;
  email: string;
}

export interface CargoVm {
  price: string;
  priceHidden: boolean;
  bodyType: string;
  truckCount: string;
  distance: string;
  isInternational: boolean;
  containered: boolean;
  temperature: string;
  loadingTypes: string;
  docs: string;
  carType: string;
  carCapacity: string;
}

export interface PaymentVm {
  form: string;
  condition: string;
  delay: string;
  currencyCode: string;
  prepay: string;
}

export interface AuctionDetailVm {
  uuid: string;
  id: number | null;
  ownOrganizationId: number | null;
  cargoNum: string;
  cargoDate: string;
  aucTypeLabel: string;
  createdAt: string;
  assemblyNum: string;
  organizer: OrganizerVm;
  contacts: ContactVm[];
  contactsHidden: boolean;
  points: RoutePointVm[];
  cargo: CargoVm;
  trading: TradingVm;
  payment: PaymentVm;
  restrictions: RestrictionsVm;
  primaryAction: PrimaryActionVm;
}

export interface BetVm {
  key: string;
  priceWithVat: string;
  priceNoVat: string;
  organizationName: string;
  organizationInn: string;
  place: string;
  placeHidden: boolean;
  isWin: boolean;
  isRejected: boolean;
  isCounter: boolean;
  cancelReason: string;
  isMy: boolean;
  createdAt: string;
  comment: string;
}

export interface BetsVm {
  hidden: boolean;
  placesHidden: boolean;
  participantsCount: number;
  items: BetVm[];
}
