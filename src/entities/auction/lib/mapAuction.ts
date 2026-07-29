import type {
  AuctionDetailDto,
  AuctionListItemDto,
  AuctionListResponseDto,
  BetDto,
  BetsResponseDto,
  CargoDto,
  ContactDto,
  OrganizerDto,
  PaymentConditionsDto,
  RestrictionsDto,
  RoutePointDto,
  TradingDto,
  VehicleRequirementsDto,
} from '@/shared/api';
import {
  EMPTY_VALUE,
  formatDate,
  formatDateTime,
  formatDistance,
  formatNumber,
  formatPrice,
  formatPricePerKm,
  formatText,
  formatVolume,
  formatWeight,
} from '@/shared/lib';
import type {
  AuctionDetailVm,
  AuctionListItemVm,
  AuctionListVm,
  BetsVm,
  BetVm,
  CargoVm,
  ContactVm,
  OrganizerVm,
  PaymentConditionsVm,
  PrimaryActionVm,
  RestrictionsVm,
  RoutePointVm,
  TradingVm,
  VehicleRequirementsVm,
} from '../model/types';
import { PRIMARY_ACTION } from '../model/types';
import {
  AUC_TYPE_LABELS,
  AUCTION_STATUS_LABELS,
  AUCTION_STATUS_TONES,
  BODY_TYPE_LABELS,
  ROUTE_POINT_KIND_LABELS,
  TRADING_STATUS_LABELS,
  TRADING_STATUS_TONES,
} from './labels';

interface PrimaryActionInput {
  canSetBet: boolean;
  hasMyBet: boolean;
  betsHidden: boolean;
}

export function resolvePrimaryAction({
  canSetBet,
  hasMyBet,
  betsHidden,
}: PrimaryActionInput): PrimaryActionVm {
  if (canSetBet && hasMyBet) {
    return { kind: PRIMARY_ACTION.EditBet, label: 'Изменить ставку', disabled: false };
  }

  if (canSetBet) {
    return { kind: PRIMARY_ACTION.CreateBet, label: 'Сделать ставку', disabled: false };
  }

  if (betsHidden) {
    return { kind: PRIMARY_ACTION.Unavailable, label: 'Ставки недоступны', disabled: true };
  }

  return { kind: PRIMARY_ACTION.ViewBets, label: 'Смотреть ставки', disabled: false };
}

export function mapCargo(dto: CargoDto, noViewCargoPrice: boolean): CargoVm {
  return {
    name: dto.name,
    weight: formatWeight(dto.weight),
    volume: formatVolume(dto.volume),
    bodyTypeLabel: BODY_TYPE_LABELS[dto.body_type],
    price: noViewCargoPrice ? EMPTY_VALUE : formatPrice(dto.price),
    priceHidden: noViewCargoPrice,
  };
}

export function mapTrading(dto: TradingDto): TradingVm {
  return {
    canSetBet: dto.can_set_bet,
    currentPrice: formatPrice(dto.current_price),
    availablePrice: formatPrice(dto.available_price),
    pricePerKm: formatPricePerKm(dto.price_per_km),
    min: formatPrice(dto.min),
    max: formatPrice(dto.max),
    step: formatPrice(dto.step),
    statusLabel: TRADING_STATUS_LABELS[dto.trading_status],
    statusTone: TRADING_STATUS_TONES[dto.trading_status],
    hasMyBet: dto.has_my_bet,
    myBetPrice: formatPrice(dto.my_bet_price),
    finishAt: formatDateTime(dto.finish_at),
    limits: {
      currentPrice: dto.current_price,
      availablePrice: dto.available_price ?? null,
      min: dto.min ?? null,
      max: dto.max ?? null,
      step: dto.step ?? null,
    },
  };
}

export function mapRoutePoint(dto: RoutePointDto, addressHidden: boolean): RoutePointVm {
  return {
    uuid: dto.uuid,
    kindLabel: ROUTE_POINT_KIND_LABELS[dto.kind],
    cityName: dto.city.name,
    regionName: formatText(dto.city.region),
    address: addressHidden ? EMPTY_VALUE : formatText(dto.address),
    addressHidden,
    dateTime: formatDateTime(dto.date),
  };
}

export function mapAuctionListItem(dto: AuctionListItemDto): AuctionListItemVm {
  const trading = mapTrading(dto.trading);

  return {
    uuid: dto.uuid,
    cargoNum: dto.cargo_num,
    aucTypeLabel: AUC_TYPE_LABELS[dto.auc_type],
    statusLabel: AUCTION_STATUS_LABELS[dto.status],
    statusTone: AUCTION_STATUS_TONES[dto.status],
    routeFrom: dto.load_point.city.name,
    routeTo: dto.unload_point.city.name,
    loadDate: formatDate(dto.load_point.date),
    unloadDate: formatDate(dto.unload_point.date),
    distance: formatDistance(dto.distance_km),
    cargo: mapCargo(dto.cargo, false),
    trading,
    primaryAction: resolvePrimaryAction({
      canSetBet: dto.trading.can_set_bet,
      hasMyBet: dto.trading.has_my_bet,
      betsHidden: false,
    }),
  };
}

export function mapAuctionList(dto: AuctionListResponseDto): AuctionListVm {
  return {
    items: dto.items.map(mapAuctionListItem),
    total: dto.total,
    page: dto.page,
    limit: dto.limit,
    pagesCount: dto.limit > 0 ? Math.ceil(dto.total / dto.limit) : 0,
  };
}

function mapContact(dto: ContactDto): ContactVm {
  return {
    name: dto.name,
    phone: formatText(dto.phone),
    email: formatText(dto.email),
  };
}

export function mapOrganizer(dto: OrganizerDto, contactsHidden: boolean): OrganizerVm {
  return {
    name: dto.name,
    inn: formatText(dto.inn),
    contacts: contactsHidden ? [] : (dto.contacts ?? []).map(mapContact),
    contactsHidden,
  };
}

function mapVehicleRequirements(
  dto: VehicleRequirementsDto | null | undefined,
): VehicleRequirementsVm | null {
  if (!dto) {
    return null;
  }

  const from = dto.temperature_from;
  const to = dto.temperature_to;
  const hasRange = (from ?? null) !== null || (to ?? null) !== null;

  return {
    bodyTypeLabels: (dto.body_types ?? []).map((bodyType) => BODY_TYPE_LABELS[bodyType]),
    temperature: hasRange ? `${from ?? EMPTY_VALUE} … ${to ?? EMPTY_VALUE} °C` : EMPTY_VALUE,
    loadingType: formatText(dto.loading_type),
    comment: formatText(dto.comment),
  };
}

function mapPaymentConditions(
  dto: PaymentConditionsDto | null | undefined,
): PaymentConditionsVm | null {
  if (!dto) {
    return null;
  }

  const days = dto.deferment_days;

  return {
    paymentType: formatText(dto.payment_type),
    deferment: days === null || days === undefined ? EMPTY_VALUE : `${days} дн.`,
    vatLabel: dto.with_vat === true ? 'С НДС' : 'Без НДС',
  };
}

function mapRestrictions(dto: RestrictionsDto): RestrictionsVm {
  return {
    hideBetsHistory: dto.hide_bets_history,
    hidePointsAddressAndContacts: dto.hide_points_address_and_contacts,
    noViewCargoPrice: dto.no_view_cargo_price,
  };
}

export function mapAuctionDetail(dto: AuctionDetailDto): AuctionDetailVm {
  const restrictions = mapRestrictions(dto.restrictions);

  return {
    uuid: dto.uuid,
    cargoNum: dto.cargo_num,
    aucTypeLabel: AUC_TYPE_LABELS[dto.auc_type],
    statusLabel: AUCTION_STATUS_LABELS[dto.status],
    statusTone: AUCTION_STATUS_TONES[dto.status],
    comment: formatText(dto.comment),
    distance: formatDistance(dto.distance_km),
    points: dto.points.map((point) =>
      mapRoutePoint(point, restrictions.hidePointsAddressAndContacts),
    ),
    cargo: mapCargo(dto.cargo, restrictions.noViewCargoPrice),
    trading: mapTrading(dto.trading),
    organizer: mapOrganizer(dto.organizer, restrictions.hidePointsAddressAndContacts),
    vehicleRequirements: mapVehicleRequirements(dto.vehicle_requirements),
    paymentConditions: mapPaymentConditions(dto.payment_conditions),
    restrictions,
    primaryAction: resolvePrimaryAction({
      canSetBet: dto.trading.can_set_bet,
      hasMyBet: dto.trading.has_my_bet,
      betsHidden: restrictions.hideBetsHistory,
    }),
  };
}

export function mapBet(dto: BetDto): BetVm {
  return {
    uuid: dto.uuid,
    priceWithVat: formatPrice(dto.price_with_vat),
    priceWithoutVat: formatPrice(dto.price_without_vat),
    carrierName: dto.carrier.name,
    carrierInn: formatText(dto.carrier.inn),
    rank: dto.is_cancelled ? EMPTY_VALUE : formatNumber(dto.rank),
    isWinner: dto.is_winner,
    isCancelled: dto.is_cancelled,
    cancelReason: formatText(dto.cancel_reason),
    isMy: dto.is_my === true,
    createdAt: formatDateTime(dto.created_at),
  };
}

export function mapBets(dto: BetsResponseDto): BetsVm {
  return {
    hidden: dto.hide_bets_history,
    participantsCount: dto.participants_count,
    items: dto.hide_bets_history ? [] : dto.items.map(mapBet),
  };
}
