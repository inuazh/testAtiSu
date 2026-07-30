import type {
  AuctionListItemDto,
  AuctionShowResponseDto,
  BetItemDto,
  RoutePointDto,
  TradingStatusDto,
} from '../dto';
import { OPERATION_TYPE, TRADING_STATUS } from '../enums';
import { CURRENT_ORGANIZATION, ownActiveBet, priceBounds, toPriceNoVat } from './betting';
import type { MockAuction, MockRoutePoint } from './types';

type ListTradingStatus = NonNullable<NonNullable<AuctionListItemDto['trading']>['status_mobile']>;

const LIST_TRADING_STATUS: Record<TradingStatusDto, ListTradingStatus> = {
  [TRADING_STATUS.NotParticipating]: TRADING_STATUS.NotParticipating,
  [TRADING_STATUS.Leading]: TRADING_STATUS.Leading,
  [TRADING_STATUS.Losing]: TRADING_STATUS.Losing,
  [TRADING_STATUS.Confirmed]: TRADING_STATUS.Confirmed,
  [TRADING_STATUS.Winner]: TRADING_STATUS.Winner,
  [TRADING_STATUS.Unknown]: TRADING_STATUS.Unknown,
  [TRADING_STATUS.OnPending]: TRADING_STATUS.Unknown,
  [TRADING_STATUS.ChoosingWinner]: TRADING_STATUS.Unknown,
  [TRADING_STATUS.Accepted]: TRADING_STATUS.Unknown,
};

function loadPoint(auction: MockAuction): MockRoutePoint {
  const point = auction.points.find((candidate) => candidate.opType === OPERATION_TYPE.Loading);

  if (point === undefined) {
    throw new Error(`У аукциона ${auction.uuid} нет точки погрузки`);
  }

  return point;
}

function unloadPoint(auction: MockAuction): MockRoutePoint {
  const points = auction.points.filter(
    (candidate) => candidate.opType === OPERATION_TYPE.Unloading,
  );
  const point = points[points.length - 1];

  if (point === undefined) {
    throw new Error(`У аукциона ${auction.uuid} нет точки выгрузки`);
  }

  return point;
}

function totalWeight(auction: MockAuction): number {
  return Number(auction.points.reduce((sum, point) => sum + point.weight, 0).toFixed(1));
}

function totalVolume(auction: MockAuction): number {
  return auction.points.reduce((sum, point) => sum + point.volume, 0);
}

function pricePerKm(auction: MockAuction): number {
  const current = auction.currentPrice ?? auction.startPrice;

  return Number((current / auction.distance).toFixed(2));
}

export function toListItem(auction: MockAuction): AuctionListItemDto {
  const load = loadPoint(auction);
  const unload = unloadPoint(auction);
  const own = ownActiveBet(auction);
  const current = auction.currentPrice ?? auction.startPrice;

  return {
    main: {
      id: auction.id,
      cargo_num: auction.cargoNum,
      cargo_date: auction.cargoDate,
      auc_type: auction.aucType,
      order_uid: auction.orderUid,
      created_at: auction.createdAt,
      priority_sort: auction.id,
      is_assembly: auction.points.length > 2,
      price_per_km: pricePerKm(auction),
    },
    organizer: {
      subscriber_id: auction.organization.subscriberId,
      organization_id: auction.organization.id,
      organization_name: auction.organization.name,
      organization_inn: auction.organization.inn,
      organization_kpp: auction.organization.kpp,
      is_hide_organization: auction.organization.isHide,
    },
    route: {
      load: {
        city: load.cityName,
        address: auction.hidePointsAddressAndContacts ? '' : load.loadingAddress,
        date: load.startDate,
        city_gc_id: load.cityGcId,
        points_count: auction.points.filter((p) => p.opType === OPERATION_TYPE.Loading).length,
      },
      unload: {
        city: unload.cityName,
        address: auction.hidePointsAddressAndContacts ? '' : unload.loadingAddress,
        date: unload.startDate,
        city_gc_id: unload.cityGcId,
        points_count: auction.points.filter((p) => p.opType === OPERATION_TYPE.Unloading).length,
      },
    },
    cargo: {
      name: load.cargoName,
      weight: totalWeight(auction),
      volume: totalVolume(auction),
      body_type: auction.bodyType,
      truck_count: auction.truckCount,
      is_cargo: true,
      is_international: auction.isInternational,
      containered: auction.containered,
      incoterms: '',
      conics: 0,
      belts: 4,
      adr: 0,
      coupling: false,
      air_pass: false,
      low_loader: false,
      additional_load: false,
      temp_from: auction.tempFrom ?? 0,
      temp_to: auction.tempTo ?? 0,
      loading_types: { side: true, top: false, rear: true, full: false },
      docs: { tir: false, cmr: auction.isInternational, t1: false, med: false },
      car: null,
    },
    trading: {
      status: auction.status,
      status_mobile: LIST_TRADING_STATUS[auction.tradingStatus],
      start_time: auction.startTime,
      stop_time: auction.stopTime,
      bid_measurement_type: auction.bidMeasurementType,
      can_set_bet: auction.canSetBet,
      allow_counter_bets: auction.allowCounterBets,
      hide_points_address_and_contacts: auction.hidePointsAddressAndContacts,
      direction: `${load.cityName} — ${unload.cityName}`,
      comment: '',
      is_bidder: own !== undefined,
      is_available: auction.canSetBet,
      is_accredited: true,
      is_favorite: auction.isFavorite,
      price: {
        start: auction.startPrice,
        current,
        current_no_vat: toPriceNoVat(current),
      },
      your: {
        bet: own !== undefined,
        last_bet: own?.price_with_vat ?? null,
      },
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      is_last_bet_with_vat: true,
    },
    payment: {
      form: auction.paymentForm,
      currency_code: auction.currencyCode,
      consignor: auction.organization.name,
      consignee: unload.contractor,
    },
  };
}

function toRoutePoint(point: MockRoutePoint, hideAddressAndContacts: boolean): RoutePointDto {
  return {
    row_num: point.rowNum,
    op_type: point.opType,
    start_date: point.startDate,
    end_date: point.endDate,
    comment: point.comment,
    contractor: point.contractor,
    contractor_inn: point.contractorInn,
    location: {
      city_name: point.cityName,
      city_full_name: point.cityFullName,
      city_gc_id: point.cityGcId,
      loading_address: hideAddressAndContacts ? '' : point.loadingAddress,
      lon: point.lon,
      lat: point.lat,
    },
    cargo: {
      name: point.cargoName,
      package_name: point.packageName,
      weight: point.weight.toFixed(1),
      volume: String(point.volume),
      length: '13.6',
      width: '2.45',
      height: '2.7',
      oversized: false,
      package_amount: 33,
    },
    contact: hideAddressAndContacts
      ? { name: '', phone: '' }
      : { name: point.contactName, phone: point.contactPhone },
  };
}

export function toDetail(auction: MockAuction): AuctionShowResponseDto {
  const bounds = priceBounds(auction);
  const own = ownActiveBet(auction);
  const current = auction.currentPrice;

  return {
    main: {
      id: auction.id,
      cargo_num: auction.cargoNum,
      cargo_date: auction.cargoDate,
      order_uid: auction.orderUid,
      auc_type: auction.aucType,
      created_at: auction.createdAt,
    },
    organizer: {
      subscriber_id: auction.organization.subscriberId,
      subscriber_code: auction.organization.subscriberCode,
      infobase_code: auction.organization.infobaseCode,
      organization_name: auction.organization.name,
      organization_inn: auction.organization.inn,
      organization_kpp: auction.organization.kpp,
      organization_id: auction.organization.id,
    },
    contacts: auction.hidePointsAddressAndContacts ? [] : auction.contacts,
    cargo: {
      price: auction.noViewCargoPrice ? '' : String(auction.cargoPrice),
      currency: 643,
      is_international: auction.isInternational,
      distance: auction.distance,
      truck_count: auction.truckCount,
      body_type: auction.bodyType,
      temp_from: auction.tempFrom,
      temp_to: auction.tempTo,
      conics: 0,
      belts: 4,
      adr: 0,
      coupling: false,
      air_pass: false,
      low_loader: false,
      additional_load: false,
      containered: auction.containered,
      container_type: null,
      container_size: null,
      loading_types: { side: true, top: false, rear: true, full: false },
      docs: { tir: false, cmr: auction.isInternational, t1: false, med: false },
      car: {
        type: auction.bodyType,
        weight: 20,
        volume: 92,
        width: 2.45,
        length: 13.6,
        height: 2.7,
      },
    },
    trading: {
      status: auction.status,
      status_mobile: auction.tradingStatus,
      start_time: auction.startTime,
      stop_time: auction.stopTime,
      bid_measurement_type: auction.bidMeasurementType,
      can_set_bet: auction.canSetBet,
      allow_counter_bets: auction.allowCounterBets,
      hide_bets_history: auction.hideBetsHistory,
      hide_places: auction.hidePlaces,
      no_view_cargo_price: auction.noViewCargoPrice,
      hide_points_address_and_contacts: auction.hidePointsAddressAndContacts,
      is_bidder: own !== undefined,
      is_favorite: auction.isFavorite,
      is_last_bet_with_vat: true,
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      send_deal_before_load: false,
      chat_id: null,
      price: {
        start: auction.startPrice,
        start_no_vat: toPriceNoVat(auction.startPrice),
        current,
        current_no_vat: current === null ? null : toPriceNoVat(current),
        available: bounds.available,
        available_no_vat: bounds.available === null ? null : toPriceNoVat(bounds.available),
        min: bounds.min,
        min_no_vat: bounds.min === null ? null : toPriceNoVat(bounds.min),
        max: bounds.max,
        max_no_vat: bounds.max === null ? null : toPriceNoVat(bounds.max),
        step: auction.step,
        step_no_vat: auction.step === null ? null : toPriceNoVat(auction.step),
        price_per_km: pricePerKm(auction),
      },
      your: {
        bet: own !== undefined,
        last_bet: own === undefined ? null : (own.price_no_vat ?? null),
        last_bet_with_vat: own?.price_with_vat ?? null,
        win: own?.is_win ?? false,
      },
      settings: {
        prolong_after_bet: 5,
        winner_confirm: 60,
        winner_counter_mode: null,
        transmission_time_in: 24,
        coefficient: null,
      },
    },
    payment: {
      condition: auction.paymentCondition,
      condition_predefined: null,
      form: auction.paymentForm,
      delay: auction.paymentDelay,
      delay_type: auction.paymentDelayType,
      currency_code: auction.currencyCode,
      prepay: null,
    },
    assembly: {
      num: auction.points.length > 2 ? `SB-${auction.id}` : null,
      date: auction.points.length > 2 ? auction.createdAt : null,
    },
    routes: auction.points.map((point) =>
      toRoutePoint(point, auction.hidePointsAddressAndContacts),
    ),
    admitted_organizations: [
      {
        id: CURRENT_ORGANIZATION.id,
        inn: CURRENT_ORGANIZATION.inn,
        is_main: true,
        name: CURRENT_ORGANIZATION.name,
        full_name: CURRENT_ORGANIZATION.name,
        site: null,
        subscriber_id: CURRENT_ORGANIZATION.subscriberId,
        subscriber_code: CURRENT_ORGANIZATION.subscriberCode,
        subscriber_role: null,
        infobase_code: CURRENT_ORGANIZATION.infobaseCode,
        infobase_address: null,
        nalog_key: null,
        hide_me: false,
        current_vat_rate: '20%',
      },
    ],
    hide_bets_history: auction.hideBetsHistory,
  };
}

export function toBetList(auction: MockAuction): BetItemDto[] {
  const bets = [...auction.bets].sort((a, b) => (a.place ?? 999) - (b.place ?? 999));

  if (!auction.hidePlaces) {
    return bets;
  }

  return bets.map((bet) => ({ ...bet, place: null }));
}
