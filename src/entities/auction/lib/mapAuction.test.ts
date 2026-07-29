import { describe, expect, it } from 'vitest';
import type {
  AuctionDetailDto,
  AuctionListItemDto,
  BetDto,
  RoutePointDto,
  TradingDto,
} from '@/shared/api';
import {
  AUC_TYPE,
  AUCTION_STATUS,
  BODY_TYPE,
  ROUTE_POINT_KIND,
  TRADING_STATUS,
} from '@/shared/api';
import { EMPTY_VALUE } from '@/shared/lib';
import { PRIMARY_ACTION } from '../model/types';
import {
  mapAuctionDetail,
  mapAuctionListItem,
  mapBet,
  mapBets,
  resolvePrimaryAction,
} from './mapAuction';

const loadPoint: RoutePointDto = {
  uuid: 'p-1',
  city: { id: 'msk', name: 'Москва', region: 'Московская область' },
  address: 'ул. Складская, д. 1',
  date: '2026-08-01T09:00:00.000Z',
  kind: ROUTE_POINT_KIND.Load,
};

const unloadPoint: RoutePointDto = {
  uuid: 'p-2',
  city: { id: 'spb', name: 'Санкт-Петербург', region: null },
  address: null,
  date: '2026-08-03T18:00:00.000Z',
  kind: ROUTE_POINT_KIND.Unload,
};

const trading: TradingDto = {
  can_set_bet: true,
  current_price: 100000,
  available_price: 97500,
  price_per_km: 142.5,
  min: 56500,
  max: 97500,
  step: 2500,
  trading_status: TRADING_STATUS.None,
  has_my_bet: false,
  my_bet_price: null,
  finish_at: '2026-08-05T12:00:00.000Z',
};

const listItem: AuctionListItemDto = {
  uuid: 'a-1',
  cargo_num: 'AU-100000',
  auc_type: AUC_TYPE.Down,
  status: AUCTION_STATUS.Trading,
  load_point: loadPoint,
  unload_point: unloadPoint,
  cargo: {
    name: 'Продукты питания',
    weight: 12.5,
    volume: 82,
    body_type: BODY_TYPE.Tent,
    price: 350000,
  },
  trading,
  distance_km: 702,
};

const detail: AuctionDetailDto = {
  uuid: 'a-1',
  cargo_num: 'AU-100000',
  auc_type: AUC_TYPE.Down,
  status: AUCTION_STATUS.Trading,
  points: [loadPoint, unloadPoint],
  cargo: listItem.cargo,
  trading,
  organizer: {
    uuid: 'o-1',
    name: 'ООО «ТрансЛогистик»',
    inn: '7701234567',
    contacts: [{ name: 'Иванов И.', phone: '+7 (900) 000-00-00', email: 'a@example.com' }],
  },
  vehicle_requirements: {
    body_types: [BODY_TYPE.Tent, BODY_TYPE.Van],
    temperature_from: -18,
    temperature_to: 4,
    loading_type: 'Задняя',
    comment: null,
  },
  payment_conditions: { payment_type: 'Безнал с НДС', deferment_days: 14, with_vat: true },
  restrictions: {
    hide_bets_history: false,
    hide_points_address_and_contacts: false,
    no_view_cargo_price: false,
  },
  distance_km: 702,
  comment: null,
};

describe('mapAuctionListItem', () => {
  it('переводит enum-значения в подписи и строит маршрут', () => {
    const vm = mapAuctionListItem(listItem);

    expect(vm.aucTypeLabel).toBe('На понижение');
    expect(vm.statusLabel).toBe('Идут торги');
    expect(vm.routeFrom).toBe('Москва');
    expect(vm.routeTo).toBe('Санкт-Петербург');
    expect(vm.cargo.bodyTypeLabel).toBe('Тент');
  });

  it('прокидывает сырые границы цены для формы ставки', () => {
    const vm = mapAuctionListItem(listItem);

    expect(vm.trading.limits).toEqual({
      currentPrice: 100000,
      availablePrice: 97500,
      min: 56500,
      max: 97500,
      step: 2500,
    });
  });

  it('подставляет прочерк вместо отсутствующей дистанции', () => {
    const vm = mapAuctionListItem({ ...listItem, distance_km: null });

    expect(vm.distance).toBe(EMPTY_VALUE);
  });
});

describe('resolvePrimaryAction', () => {
  it('предлагает создать ставку, когда ставок ещё нет', () => {
    const action = resolvePrimaryAction({ canSetBet: true, hasMyBet: false, betsHidden: false });

    expect(action).toEqual({
      kind: PRIMARY_ACTION.CreateBet,
      label: 'Сделать ставку',
      disabled: false,
    });
  });

  it('предлагает изменить ставку, когда своя ставка уже есть', () => {
    const action = resolvePrimaryAction({ canSetBet: true, hasMyBet: true, betsHidden: false });

    expect(action.kind).toBe(PRIMARY_ACTION.EditBet);
  });

  it('предлагает смотреть ставки, когда ставить нельзя', () => {
    const action = resolvePrimaryAction({ canSetBet: false, hasMyBet: false, betsHidden: false });

    expect(action.kind).toBe(PRIMARY_ACTION.ViewBets);
  });

  it('отключает действие, когда ставить нельзя и история скрыта', () => {
    const action = resolvePrimaryAction({ canSetBet: false, hasMyBet: false, betsHidden: true });

    expect(action.kind).toBe(PRIMARY_ACTION.Unavailable);
    expect(action.disabled).toBe(true);
  });
});

describe('mapAuctionDetail', () => {
  it('скрывает адреса и контакты по hide_points_address_and_contacts', () => {
    const vm = mapAuctionDetail({
      ...detail,
      restrictions: { ...detail.restrictions, hide_points_address_and_contacts: true },
    });

    expect(vm.points.every((point) => point.address === EMPTY_VALUE)).toBe(true);
    expect(vm.points.every((point) => point.addressHidden)).toBe(true);
    expect(vm.organizer.contacts).toEqual([]);
    expect(vm.organizer.contactsHidden).toBe(true);
  });

  it('скрывает цену груза по no_view_cargo_price', () => {
    const vm = mapAuctionDetail({
      ...detail,
      restrictions: { ...detail.restrictions, no_view_cargo_price: true },
    });

    expect(vm.cargo.price).toBe(EMPTY_VALUE);
    expect(vm.cargo.priceHidden).toBe(true);
  });

  it('отключает действие, когда ставки закрыты и история скрыта', () => {
    const vm = mapAuctionDetail({
      ...detail,
      trading: { ...trading, can_set_bet: false },
      restrictions: { ...detail.restrictions, hide_bets_history: true },
    });

    expect(vm.primaryAction.kind).toBe(PRIMARY_ACTION.Unavailable);
  });

  it('показывает диапазон температур и отсрочку', () => {
    const vm = mapAuctionDetail(detail);

    expect(vm.vehicleRequirements?.temperature).toBe('-18 … 4 °C');
    expect(vm.paymentConditions?.deferment).toBe('14 дн.');
    expect(vm.paymentConditions?.vatLabel).toBe('С НДС');
  });

  it('отдаёт null для отсутствующих необязательных блоков', () => {
    const vm = mapAuctionDetail({
      ...detail,
      vehicle_requirements: null,
      payment_conditions: null,
    });

    expect(vm.vehicleRequirements).toBeNull();
    expect(vm.paymentConditions).toBeNull();
  });
});

describe('mapBets', () => {
  const bet: BetDto = {
    uuid: 'b-1',
    price_with_vat: 97500,
    price_without_vat: 81250,
    carrier: { uuid: 'c-1', name: 'ООО «АвтоЛайн»', inn: null },
    rank: 1,
    is_winner: false,
    is_cancelled: false,
    cancel_reason: null,
    is_my: true,
    created_at: '2026-07-30T10:00:00.000Z',
  };

  it('маппит ставку с ИНН-прочерком', () => {
    const vm = mapBet(bet);

    expect(vm.carrierInn).toBe(EMPTY_VALUE);
    expect(vm.isMy).toBe(true);
    expect(vm.rank).toBe('1');
  });

  it('прячет место и показывает причину для отменённой ставки', () => {
    const vm = mapBet({
      ...bet,
      rank: 0,
      is_cancelled: true,
      cancel_reason: 'Ставка отозвана перевозчиком',
    });

    expect(vm.rank).toBe(EMPTY_VALUE);
    expect(vm.cancelReason).toBe('Ставка отозвана перевозчиком');
  });

  it('очищает список, когда история ставок скрыта', () => {
    const vm = mapBets({ items: [bet], participants_count: 4, hide_bets_history: true });

    expect(vm.hidden).toBe(true);
    expect(vm.items).toEqual([]);
    expect(vm.participantsCount).toBe(4);
  });
});
