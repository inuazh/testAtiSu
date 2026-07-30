import type {
  AuctionListItemDto,
  AuctionListResponseDto,
  AuctionShowResponseDto,
  AuctionShowTradingDto,
  BetItemDto,
  BetListResponseDto,
  ContactDto,
  DocsDto,
  LoadingTypesDto,
  RoutePointDto,
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
  PaymentVm,
  PricePairVm,
  PrimaryActionVm,
  RestrictionsVm,
  RoutePointVm,
  TradingVm,
} from '../model/types';
import { PRIMARY_ACTION } from '../model/types';
import {
  AUCTION_STATUS_LABELS,
  AUCTION_STATUS_TONES,
  AUCTION_TYPE_LABELS,
  BID_MEASUREMENT_TYPE_LABELS,
  OPERATION_TYPE_LABELS,
  PAYMENT_DELAY_TYPE_LABELS,
  resolveLabel,
  resolveTone,
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

function pricePair(
  withVat: number | null | undefined,
  noVat: number | null | undefined,
): PricePairVm {
  return { withVat: formatPrice(withVat), noVat: formatPrice(noVat) };
}

function parsePriceText(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === '') {
    return EMPTY_VALUE;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? formatPrice(parsed) : value;
}

const LOADING_TYPE_LABELS: Record<string, string> = {
  side: 'боковая',
  top: 'верхняя',
  rear: 'задняя',
  full: 'полная растентовка',
};

const DOCS_LABELS: Record<string, string> = {
  tir: 'TIR',
  cmr: 'CMR',
  t1: 'T1',
  med: 'Мед. книжка',
};

function flagList(
  source: Record<string, boolean | undefined>,
  labels: Record<string, string>,
): string {
  const active = Object.entries(source)
    .filter(([, enabled]) => enabled === true)
    .map(([key]) => labels[key] ?? key);

  return active.length > 0 ? active.join(', ') : EMPTY_VALUE;
}

function loadingTypesText(dto: LoadingTypesDto | undefined): string {
  return flagList({ ...dto }, LOADING_TYPE_LABELS);
}

function docsText(dto: DocsDto | undefined): string {
  return flagList({ ...dto }, DOCS_LABELS);
}

function temperatureText(from: number | null | undefined, to: number | null | undefined): string {
  if ((from ?? null) === null && (to ?? null) === null) {
    return EMPTY_VALUE;
  }

  return `${from ?? EMPTY_VALUE} … ${to ?? EMPTY_VALUE} °C`;
}

export function mapAuctionListItem(
  dto: AuctionListItemDto,
  auctionUuid: string,
): AuctionListItemVm {
  const main = dto.main;
  const trading = dto.trading;
  const price = trading?.price;
  const route = dto.route;
  const cargo = dto.cargo;
  const organizer = dto.organizer;

  const hasMyBet = trading?.your?.bet === true;
  const canSetBet = trading?.can_set_bet === true;

  return {
    uuid: auctionUuid,
    id: main?.id ?? null,
    cargoNum: formatText(main?.cargo_num),
    aucTypeLabel: resolveLabel(AUCTION_TYPE_LABELS, main?.auc_type),
    statusLabel: resolveLabel(AUCTION_STATUS_LABELS, trading?.status),
    statusTone: resolveTone(AUCTION_STATUS_TONES, trading?.status),
    tradingStatusLabel: resolveLabel(TRADING_STATUS_LABELS, trading?.status_mobile),
    tradingStatusTone: resolveTone(TRADING_STATUS_TONES, trading?.status_mobile),
    routeFrom: formatText(route?.load?.city),
    routeTo: formatText(route?.unload?.city),
    loadDate: formatDate(route?.load?.date),
    unloadDate: formatDate(route?.unload?.date),
    cargoName: formatText(cargo?.name),
    cargoWeight: formatWeight(cargo?.weight),
    cargoVolume: formatVolume(cargo?.volume),
    bodyType: formatText(cargo?.body_type),
    currentPrice: formatPrice(price?.current),
    currentPriceNoVat: formatPrice(price?.current_no_vat),
    pricePerKm: formatPricePerKm(main?.price_per_km),
    hasMyBet,
    myBetPrice: formatPrice(trading?.your?.last_bet),
    canSetBet,
    organizationName: formatText(organizer?.organization_name),
    organizationHidden: organizer?.is_hide_organization === true,
    primaryAction: resolvePrimaryAction({ canSetBet, hasMyBet, betsHidden: false }),
  };
}

export function mapAuctionList(
  dto: AuctionListResponseDto,
  uuidOf: (item: AuctionListItemDto, index: number) => string,
): AuctionListVm {
  const meta = dto.meta;
  const items = dto.data ?? [];

  return {
    items: items.map((item, index) => mapAuctionListItem(item, uuidOf(item, index))),
    currentPage: meta?.current_page ?? 1,
    lastPage: meta?.last_page ?? 1,
    perPage: meta?.per_page ?? items.length,
    total: meta?.total ?? items.length,
  };
}

function mapTrading(dto: AuctionShowTradingDto | undefined): TradingVm {
  const price = dto?.price;
  const your = dto?.your;

  return {
    canSetBet: dto?.can_set_bet === true,
    statusLabel: resolveLabel(TRADING_STATUS_LABELS, dto?.status_mobile),
    statusTone: resolveTone(TRADING_STATUS_TONES, dto?.status_mobile),
    auctionStatusLabel: resolveLabel(AUCTION_STATUS_LABELS, dto?.status),
    auctionStatusTone: resolveTone(AUCTION_STATUS_TONES, dto?.status),
    bidMeasurementLabel: resolveLabel(BID_MEASUREMENT_TYPE_LABELS, dto?.bid_measurement_type),
    startTime: formatDateTime(dto?.start_time),
    stopTime: formatDateTime(dto?.stop_time),
    currentPrice: pricePair(price?.current, price?.current_no_vat),
    availablePrice: pricePair(price?.available, price?.available_no_vat),
    minPrice: pricePair(price?.min, price?.min_no_vat),
    maxPrice: pricePair(price?.max, price?.max_no_vat),
    step: pricePair(price?.step, price?.step_no_vat),
    pricePerKm: formatPricePerKm(price?.price_per_km),
    hasMyBet: your?.bet === true,
    myBetWithVat: formatPrice(your?.last_bet_with_vat),
    myBetNoVat: formatPrice(your?.last_bet),
    isWinner: your?.win === true,
    limits: {
      current: price?.current ?? null,
      available: price?.available ?? null,
      min: price?.min ?? null,
      max: price?.max ?? null,
      step: price?.step ?? null,
    },
  };
}

function mapRestrictions(dto: AuctionShowResponseDto): RestrictionsVm {
  const trading = dto.trading;

  return {
    hideBetsHistory: (trading?.hide_bets_history ?? dto.hide_bets_history) === true,
    hidePlaces: trading?.hide_places === true,
    hidePointsAddressAndContacts: trading?.hide_points_address_and_contacts === true,
    noViewCargoPrice: trading?.no_view_cargo_price === true,
  };
}

function mapRoutePoint(dto: RoutePointDto, index: number, addressHidden: boolean): RoutePointVm {
  const location = dto.location;
  const cargo = dto.cargo;
  const contact = dto.contact;

  return {
    key: `${dto.row_num ?? index}-${location?.city_gc_id ?? index}`,
    opTypeLabel: resolveLabel(OPERATION_TYPE_LABELS, dto.op_type),
    cityName: formatText(location?.city_name),
    cityFullName: formatText(location?.city_full_name),
    address: addressHidden ? EMPTY_VALUE : formatText(location?.loading_address),
    addressHidden,
    startDate: formatDateTime(dto.start_date),
    endDate: formatDateTime(dto.end_date),
    comment: formatText(dto.comment),
    contractor: formatText(dto.contractor),
    cargoName: formatText(cargo?.name),
    packageName: formatText(cargo?.package_name),
    weight: formatText(cargo?.weight),
    volume: formatText(cargo?.volume),
    contactName: addressHidden ? EMPTY_VALUE : formatText(contact?.name),
    contactPhone: addressHidden ? EMPTY_VALUE : formatText(contact?.phone),
  };
}

function mapContact(dto: ContactDto, index: number): ContactVm {
  return {
    key: dto.uid ?? `contact-${index}`,
    name: formatText(dto.name),
    phone: formatText(dto.phone),
    workPhone: formatText(dto.work_phone),
    email: formatText(dto.email),
  };
}

function mapOrganizer(dto: AuctionShowResponseDto['organizer']): OrganizerVm {
  return {
    name: formatText(dto?.organization_name),
    inn: formatText(dto?.organization_inn),
    kpp: formatText(dto?.organization_kpp),
    subscriberCode: formatText(dto?.subscriber_code),
  };
}

function mapCargo(dto: AuctionShowResponseDto['cargo'], priceHidden: boolean): CargoVm {
  const car = dto?.car;

  return {
    price: priceHidden ? EMPTY_VALUE : parsePriceText(dto?.price),
    priceHidden,
    bodyType: formatText(dto?.body_type),
    truckCount: formatNumber(dto?.truck_count),
    distance: formatDistance(dto?.distance),
    isInternational: dto?.is_international === true,
    containered: dto?.containered === true,
    temperature: temperatureText(dto?.temp_from, dto?.temp_to),
    loadingTypes: loadingTypesText(dto?.loading_types),
    docs: docsText(dto?.docs),
    carType: formatText(car?.type),
    carCapacity:
      car === undefined || car === null
        ? EMPTY_VALUE
        : `${formatWeight(car.weight)} · ${formatVolume(car.volume)}`,
  };
}

function mapPayment(dto: AuctionShowResponseDto['payment']): PaymentVm {
  const delay = dto?.delay;

  return {
    form: formatText(dto?.form),
    condition: formatText(dto?.condition ?? dto?.condition_predefined),
    delay:
      delay === null || delay === undefined
        ? EMPTY_VALUE
        : `${delay} ${resolveLabel(PAYMENT_DELAY_TYPE_LABELS, dto?.delay_type)}`,
    currencyCode: formatText(dto?.currency_code),
    prepay: formatText(dto?.prepay),
  };
}

export function mapAuctionDetail(
  dto: AuctionShowResponseDto,
  auctionUuid: string,
): AuctionDetailVm {
  const restrictions = mapRestrictions(dto);
  const trading = mapTrading(dto.trading);

  return {
    uuid: auctionUuid,
    id: dto.main?.id ?? null,
    ownOrganizationId: findOwnOrganizationId(dto),
    cargoNum: formatText(dto.main?.cargo_num),
    cargoDate: formatDate(dto.main?.cargo_date),
    aucTypeLabel: resolveLabel(AUCTION_TYPE_LABELS, dto.main?.auc_type),
    createdAt: formatDateTime(dto.main?.created_at),
    assemblyNum: formatText(dto.assembly?.num),
    organizer: mapOrganizer(dto.organizer),
    contacts: restrictions.hidePointsAddressAndContacts ? [] : (dto.contacts ?? []).map(mapContact),
    contactsHidden: restrictions.hidePointsAddressAndContacts,
    points: (dto.routes ?? []).map((point, index) =>
      mapRoutePoint(point, index, restrictions.hidePointsAddressAndContacts),
    ),
    cargo: mapCargo(dto.cargo, restrictions.noViewCargoPrice),
    trading,
    payment: mapPayment(dto.payment),
    restrictions,
    primaryAction: resolvePrimaryAction({
      canSetBet: trading.canSetBet,
      hasMyBet: trading.hasMyBet,
      betsHidden: restrictions.hideBetsHistory,
    }),
  };
}

export function mapBet(
  dto: BetItemDto,
  ownOrganizationId: number | null,
  placesHidden: boolean,
): BetVm {
  const priceInfo = dto.price_info;
  const isRejected = dto.is_rejected === true;

  return {
    key: String(dto.id ?? `${dto.organization_id}-${dto.created_at}`),
    priceWithVat: formatPrice(dto.price_with_vat ?? priceInfo?.price_with_vat),
    priceNoVat: formatPrice(dto.price_no_vat ?? priceInfo?.price_no_vat),
    organizationName: formatText(dto.organization_name),
    organizationInn: formatText(dto.organization_inn),
    place: placesHidden || isRejected ? EMPTY_VALUE : formatNumber(dto.place),
    placeHidden: placesHidden,
    isWin: dto.is_win === true,
    isRejected,
    isCounter: dto.is_counter === true,
    cancelReason: formatText(dto.cancel_reason),
    isMy: ownOrganizationId !== null && dto.organization_id === ownOrganizationId,
    createdAt: formatDateTime(dto.created_at),
    comment: formatText(dto.transporter_comment),
  };
}

interface MapBetsOptions {
  hidden: boolean;
  placesHidden: boolean;
  ownOrganizationId: number | null;
}

export function mapBets(dto: BetListResponseDto, options: MapBetsOptions): BetsVm {
  const bets = dto.bets ?? [];

  // participants_count в схеме нет: считаем по уникальным organization_id непроигранных ставок
  const participants = new Set(
    bets.filter((bet) => bet.is_rejected !== true).map((bet) => bet.organization_id),
  );

  return {
    hidden: options.hidden,
    placesHidden: options.placesHidden,
    participantsCount: participants.size,
    items: options.hidden
      ? []
      : bets.map((bet) => mapBet(bet, options.ownOrganizationId, options.placesHidden)),
  };
}

export function findOwnOrganizationId(dto: AuctionShowResponseDto): number | null {
  const main = (dto.admitted_organizations ?? []).find(
    (organization) => organization.is_main === true,
  );

  return main?.id ?? null;
}
