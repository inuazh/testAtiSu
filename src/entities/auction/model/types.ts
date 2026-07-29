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

export interface RoutePointVm {
  uuid: string;
  kindLabel: string;
  cityName: string;
  regionName: string;
  address: string;
  addressHidden: boolean;
  dateTime: string;
}

export interface CargoVm {
  name: string;
  weight: string;
  volume: string;
  bodyTypeLabel: string;
  price: string;
  priceHidden: boolean;
}

export interface TradingVm {
  canSetBet: boolean;
  currentPrice: string;
  availablePrice: string;
  pricePerKm: string;
  min: string;
  max: string;
  step: string;
  statusLabel: string;
  statusTone: BadgeTone;
  hasMyBet: boolean;
  myBetPrice: string;
  finishAt: string;
  limits: {
    currentPrice: number | null;
    availablePrice: number | null;
    min: number | null;
    max: number | null;
    step: number | null;
  };
}

export interface AuctionListItemVm {
  uuid: string;
  cargoNum: string;
  aucTypeLabel: string;
  statusLabel: string;
  statusTone: BadgeTone;
  routeFrom: string;
  routeTo: string;
  loadDate: string;
  unloadDate: string;
  distance: string;
  cargo: CargoVm;
  trading: TradingVm;
  primaryAction: PrimaryActionVm;
}

export interface AuctionListVm {
  items: AuctionListItemVm[];
  total: number;
  page: number;
  limit: number;
  pagesCount: number;
}

export interface ContactVm {
  name: string;
  phone: string;
  email: string;
}

export interface OrganizerVm {
  name: string;
  inn: string;
  contacts: ContactVm[];
  contactsHidden: boolean;
}

export interface VehicleRequirementsVm {
  bodyTypeLabels: string[];
  temperature: string;
  loadingType: string;
  comment: string;
}

export interface PaymentConditionsVm {
  paymentType: string;
  deferment: string;
  vatLabel: string;
}

export interface RestrictionsVm {
  hideBetsHistory: boolean;
  hidePointsAddressAndContacts: boolean;
  noViewCargoPrice: boolean;
}

export interface AuctionDetailVm {
  uuid: string;
  cargoNum: string;
  aucTypeLabel: string;
  statusLabel: string;
  statusTone: BadgeTone;
  comment: string;
  distance: string;
  points: RoutePointVm[];
  cargo: CargoVm;
  trading: TradingVm;
  organizer: OrganizerVm;
  vehicleRequirements: VehicleRequirementsVm | null;
  paymentConditions: PaymentConditionsVm | null;
  restrictions: RestrictionsVm;
  primaryAction: PrimaryActionVm;
}

export interface BetVm {
  uuid: string;
  priceWithVat: string;
  priceWithoutVat: string;
  carrierName: string;
  carrierInn: string;
  rank: string;
  isWinner: boolean;
  isCancelled: boolean;
  cancelReason: string;
  isMy: boolean;
  createdAt: string;
}

export interface BetsVm {
  hidden: boolean;
  participantsCount: number;
  items: BetVm[];
}
