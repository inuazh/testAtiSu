import { describe, expect, it } from 'vitest';
import type {
  AuctionListItemDto,
  AuctionListResponseDto,
  AuctionShowResponseDto,
  BetItemDto,
  BetListResponseDto,
} from '@/shared/api';
import { AUCTION_STATUS, AUCTION_TYPE, OPERATION_TYPE, TRADING_STATUS } from '@/shared/api';
import { EMPTY_VALUE } from '@/shared/lib';
import { PRIMARY_ACTION } from '../model/types';
import { UNKNOWN_LABEL } from './labels';
import {
  findOwnOrganizationId,
  mapAuctionDetail,
  mapAuctionList,
  mapAuctionListItem,
  mapBets,
  resolvePrimaryAction,
} from './mapAuction';

const AUCTION_UUID = '550e8400-e29b-41d4-a716-446655440000';

const listItem: AuctionListItemDto = {
  main: {
    id: 1224,
    cargo_num: '00000001059',
    cargo_date: '2026-05-26T09:00:00+03:00',
    auc_type: AUCTION_TYPE.Down,
    order_uid: AUCTION_UUID,
    created_at: '2026-05-20T09:00:00+03:00',
    priority_sort: 1,
    is_assembly: false,
    price_per_km: 142.5,
  },
  organizer: {
    subscriber_id: 330,
    organization_id: 4400,
    organization_name: 'ООО «ТрансЛогистик»',
    organization_inn: '7701234567',
    organization_kpp: '770101001',
    is_hide_organization: false,
  },
  route: {
    load: {
      city: 'Пермь',
      address: 'ул. Складская, 1',
      date: '2026-05-26T09:00:00+03:00',
      city_gc_id: 1100,
      points_count: 1,
    },
    unload: {
      city: 'Москва',
      address: 'ул. Логистическая, 5',
      date: '2026-05-28T18:00:00+03:00',
      city_gc_id: 100,
      points_count: 1,
    },
  },
  cargo: {
    name: 'Продукты питания',
    weight: 12.5,
    volume: 82,
    body_type: 'тентованный',
    truck_count: 1,
  },
  trading: {
    status: AUCTION_STATUS.Auction,
    status_mobile: TRADING_STATUS.NotParticipating,
    can_set_bet: true,
    is_bidder: false,
    is_available: true,
    price: { start: 100000, current: 97500, current_no_vat: 81250 },
    your: { bet: false, last_bet: null },
  },
  payment: { form: 'Безналичный расчёт с НДС', currency_code: 'RUB' },
};

const detail: AuctionShowResponseDto = {
  main: {
    id: 1224,
    cargo_num: '00000001059',
    cargo_date: '2026-05-26T09:00:00+03:00',
    order_uid: AUCTION_UUID,
    auc_type: AUCTION_TYPE.Down,
    created_at: '2026-05-20T09:00:00+03:00',
  },
  organizer: {
    subscriber_id: 330,
    subscriber_code: 'SUB-330',
    infobase_code: 'IB-01',
    organization_name: 'ООО «ТрансЛогистик»',
    organization_inn: '7701234567',
    organization_kpp: '770101001',
    organization_id: 4400,
  },
  contacts: [
    {
      name: 'Иванов И. И.',
      phone: '+7 900 000-00-00',
      work_phone: null,
      uid: 'c1',
      email: 'a@b.c',
    },
  ],
  cargo: {
    price: '350000',
    currency: 643,
    is_international: false,
    distance: 702,
    truck_count: 1,
    body_type: 'тентованный',
    temp_from: -18,
    temp_to: 4,
    containered: false,
    loading_types: { side: true, top: false, rear: true, full: false },
    docs: { tir: false, cmr: false, t1: false, med: false },
    car: { type: 'тентованный', weight: 20, volume: 92, width: 2.45, length: 13.6, height: 2.7 },
  },
  trading: {
    status: AUCTION_STATUS.Auction,
    status_mobile: TRADING_STATUS.NotParticipating,
    start_time: '2026-05-25T09:00:00+03:00',
    stop_time: '2026-05-27T18:00:00+03:00',
    can_set_bet: true,
    hide_bets_history: false,
    hide_places: false,
    no_view_cargo_price: false,
    hide_points_address_and_contacts: false,
    is_bidder: false,
    price: {
      start: 100000,
      start_no_vat: 83333,
      current: 100000,
      current_no_vat: 83333,
      available: 97500,
      available_no_vat: 81250,
      min: 56500,
      min_no_vat: 47083,
      max: 97500,
      max_no_vat: 81250,
      step: 2500,
      step_no_vat: 2083,
      price_per_km: 142.5,
    },
    your: { bet: false, last_bet: null, last_bet_with_vat: null, win: false },
  },
  payment: {
    condition: 'Оплата по оригиналам',
    form: 'Безналичный расчёт с НДС',
    delay: 14,
    delay_type: 'CalendarDays',
    currency_code: 'RUB',
    prepay: null,
  },
  routes: [
    {
      row_num: 1,
      op_type: OPERATION_TYPE.Loading,
      start_date: '2026-05-26T09:00:00+03:00',
      end_date: '2026-05-26T14:00:00+03:00',
      comment: null,
      contractor: 'ООО «Склад»',
      contractor_inn: '123',
      location: {
        city_name: 'Пермь',
        city_full_name: 'Пермь, Пермский край',
        city_gc_id: 1100,
        loading_address: 'ул. Складская, 1',
        lon: 56.2,
        lat: 58.0,
      },
      cargo: { name: 'Продукты', package_name: 'Паллеты', weight: '12.5', volume: '82' },
      contact: { name: 'Иванов И. И.', phone: '+7 900 000-00-00' },
    },
  ],
  assembly: { num: null, date: null },
  admitted_organizations: [
    {
      id: 770001,
      inn: '7701234567',
      is_main: true,
      name: 'ООО «Мой Перевозчик»',
      full_name: 'ООО «Мой Перевозчик»',
      subscriber_id: 900001,
      subscriber_code: 'SUB-900001',
      infobase_code: 'IB-01',
    },
  ],
  hide_bets_history: false,
};

function emptyDetail(overrides: Partial<AuctionShowResponseDto> = {}): AuctionShowResponseDto {
  return {
    main: {},
    organizer: {},
    contacts: [],
    cargo: {},
    trading: {},
    payment: {},
    assembly: {},
    routes: [],
    admitted_organizations: [],
    ...overrides,
  };
}

describe('mapAuctionListItem', () => {
  it('читает вложенные main/route/cargo/trading', () => {
    const vm = mapAuctionListItem(listItem, AUCTION_UUID);

    expect(vm.cargoNum).toBe('00000001059');
    expect(vm.aucTypeLabel).toBe('На понижение');
    expect(vm.statusLabel).toBe('Идут торги');
    expect(vm.tradingStatusLabel).toBe('Не участвую');
    expect(vm.routeFrom).toBe('Пермь');
    expect(vm.routeTo).toBe('Москва');
    expect(vm.cargoName).toBe('Продукты питания');
  });

  it('берёт цены из trading.price', () => {
    const vm = mapAuctionListItem(listItem, AUCTION_UUID);

    expect(vm.currentPrice).toContain('97');
    expect(vm.currentPriceNoVat).toContain('81');
  });

  it('переживает полностью пустой DTO', () => {
    const vm = mapAuctionListItem({}, AUCTION_UUID);

    expect(vm.cargoNum).toBe(EMPTY_VALUE);
    expect(vm.aucTypeLabel).toBe(UNKNOWN_LABEL);
    expect(vm.statusLabel).toBe(UNKNOWN_LABEL);
    expect(vm.tradingStatusLabel).toBe(UNKNOWN_LABEL);
    expect(vm.canSetBet).toBe(false);
    expect(vm.hasMyBet).toBe(false);
  });

  it('отображает Unknown нейтрально, а не падает', () => {
    const vm = mapAuctionListItem(
      {
        main: { auc_type: AUCTION_TYPE.Unknown },
        trading: { status: AUCTION_STATUS.Unknown, status_mobile: TRADING_STATUS.Unknown },
      },
      AUCTION_UUID,
    );

    expect(vm.aucTypeLabel).toBe(UNKNOWN_LABEL);
    expect(vm.statusLabel).toBe(UNKNOWN_LABEL);
    expect(vm.statusTone).toBe('neutral');
    expect(vm.tradingStatusTone).toBe('neutral');
  });
});

describe('mapAuctionList', () => {
  it('раскладывает data и meta', () => {
    const response: AuctionListResponseDto = {
      data: [listItem],
      meta: { current_page: 3, from: 41, last_page: 29, per_page: 20, to: 41, total: 575 },
    };

    const vm = mapAuctionList(response, (item) => item.main?.order_uid ?? '');

    expect(vm.items).toHaveLength(1);
    expect(vm.items[0]?.uuid).toBe(AUCTION_UUID);
    expect(vm.currentPage).toBe(3);
    expect(vm.lastPage).toBe(29);
    expect(vm.perPage).toBe(20);
    expect(vm.total).toBe(575);
  });

  it('переживает отсутствие meta', () => {
    const vm = mapAuctionList({ data: [listItem] }, () => AUCTION_UUID);

    expect(vm.currentPage).toBe(1);
    expect(vm.lastPage).toBe(1);
    expect(vm.total).toBe(1);
  });

  it('переживает отсутствие data', () => {
    const vm = mapAuctionList({}, () => AUCTION_UUID);

    expect(vm.items).toEqual([]);
    expect(vm.total).toBe(0);
  });
});

describe('mapAuctionDetail', () => {
  it('собирает ограничения из trading, включая hide_places', () => {
    const vm = mapAuctionDetail(
      {
        ...detail,
        trading: {
          ...detail.trading,
          hide_bets_history: true,
          hide_places: true,
          no_view_cargo_price: true,
          hide_points_address_and_contacts: true,
        },
      },
      AUCTION_UUID,
    );

    expect(vm.restrictions).toEqual({
      hideBetsHistory: true,
      hidePlaces: true,
      hidePointsAddressAndContacts: true,
      noViewCargoPrice: true,
    });
  });

  it('скрывает адреса, контакты и цену груза', () => {
    const vm = mapAuctionDetail(
      {
        ...detail,
        trading: {
          ...detail.trading,
          no_view_cargo_price: true,
          hide_points_address_and_contacts: true,
        },
      },
      AUCTION_UUID,
    );

    expect(vm.contacts).toEqual([]);
    expect(vm.contactsHidden).toBe(true);
    expect(vm.points.every((point) => point.address === EMPTY_VALUE)).toBe(true);
    expect(vm.points.every((point) => point.contactPhone === EMPTY_VALUE)).toBe(true);
    expect(vm.cargo.price).toBe(EMPTY_VALUE);
    expect(vm.cargo.priceHidden).toBe(true);
  });

  it('поднимает границы цены из trading.price в limits', () => {
    const vm = mapAuctionDetail(detail, AUCTION_UUID);

    expect(vm.trading.limits).toEqual({
      current: 100000,
      available: 97500,
      min: 56500,
      max: 97500,
      step: 2500,
    });
  });

  it('раскладывает цены на пары с НДС и без', () => {
    const vm = mapAuctionDetail(detail, AUCTION_UUID);

    expect(vm.trading.availablePrice.withVat).toContain('97');
    expect(vm.trading.availablePrice.noVat).toContain('81');
    expect(vm.trading.step.withVat).toContain('2');
    expect(vm.trading.step.noVat).toContain('2');
  });

  it('падает на hide_bets_history из корня, если в trading его нет', () => {
    const { hide_bets_history: _omitted, ...tradingWithoutFlag } = detail.trading;
    const vm = mapAuctionDetail(
      { ...detail, trading: tradingWithoutFlag, hide_bets_history: true },
      AUCTION_UUID,
    );

    expect(vm.restrictions.hideBetsHistory).toBe(true);
  });

  it('переживает detail с пустыми блоками', () => {
    const vm = mapAuctionDetail(emptyDetail(), AUCTION_UUID);

    expect(vm.cargoNum).toBe(EMPTY_VALUE);
    expect(vm.trading.canSetBet).toBe(false);
    expect(vm.points).toEqual([]);
    expect(vm.contacts).toEqual([]);
    expect(vm.primaryAction.kind).toBe(PRIMARY_ACTION.ViewBets);
  });

  it('форматирует отсрочку с типом дней', () => {
    const vm = mapAuctionDetail(detail, AUCTION_UUID);

    expect(vm.payment.delay).toBe('14 календарных дн.');
  });
});

describe('findOwnOrganizationId', () => {
  it('берёт организацию с is_main', () => {
    expect(findOwnOrganizationId(detail)).toBe(770001);
  });

  it('возвращает null, когда основной организации нет', () => {
    expect(findOwnOrganizationId(emptyDetail())).toBeNull();
    expect(
      findOwnOrganizationId(emptyDetail({ admitted_organizations: [{ id: 1, is_main: false }] })),
    ).toBeNull();
  });
});

describe('mapBets', () => {
  const bet: BetItemDto = {
    id: 501,
    created_at: '2026-05-26T10:00:00+03:00',
    price_with_vat: 97500,
    price_no_vat: 81250,
    organization_id: 770001,
    organization_inn: '7701234567',
    organization_name: 'ООО «Мой Перевозчик»',
    place: 1,
    is_win: false,
    is_rejected: false,
    is_counter: false,
    cancel_reason: '',
  };

  const other: BetItemDto = { ...bet, id: 502, organization_id: 880002, place: 2 };

  const response: BetListResponseDto = { bets: [bet, other] };

  it('считает участников по уникальным organization_id', () => {
    const vm = mapBets(response, { hidden: false, placesHidden: false, ownOrganizationId: 770001 });

    expect(vm.participantsCount).toBe(2);
  });

  it('не считает отклонённые ставки в участниках', () => {
    const vm = mapBets(
      { bets: [bet, { ...other, is_rejected: true }] },
      { hidden: false, placesHidden: false, ownOrganizationId: 770001 },
    );

    expect(vm.participantsCount).toBe(1);
  });

  it('не задваивает участника по нескольким ставкам одной организации', () => {
    const vm = mapBets(
      { bets: [bet, { ...bet, id: 503 }] },
      { hidden: false, placesHidden: false, ownOrganizationId: 770001 },
    );

    expect(vm.participantsCount).toBe(1);
  });

  it('помечает свою ставку по organization_id', () => {
    const vm = mapBets(response, { hidden: false, placesHidden: false, ownOrganizationId: 770001 });

    expect(vm.items[0]?.isMy).toBe(true);
    expect(vm.items[1]?.isMy).toBe(false);
  });

  it('прячет место при hide_places', () => {
    const vm = mapBets(response, { hidden: false, placesHidden: true, ownOrganizationId: null });

    expect(vm.items.every((item) => item.place === EMPTY_VALUE)).toBe(true);
    expect(vm.placesHidden).toBe(true);
  });

  it('прячет место у отклонённой ставки и показывает причину', () => {
    const vm = mapBets(
      { bets: [{ ...bet, is_rejected: true, cancel_reason: 'Не подтверждены документы' }] },
      { hidden: false, placesHidden: false, ownOrganizationId: null },
    );

    expect(vm.items[0]?.place).toBe(EMPTY_VALUE);
    expect(vm.items[0]?.isRejected).toBe(true);
    expect(vm.items[0]?.cancelReason).toBe('Не подтверждены документы');
  });

  it('очищает список при скрытой истории', () => {
    const vm = mapBets(response, { hidden: true, placesHidden: false, ownOrganizationId: null });

    expect(vm.hidden).toBe(true);
    expect(vm.items).toEqual([]);
  });

  it('переживает пустой список ставок', () => {
    const vm = mapBets(
      { bets: [] },
      { hidden: false, placesHidden: false, ownOrganizationId: null },
    );

    expect(vm.items).toEqual([]);
    expect(vm.participantsCount).toBe(0);
  });

  it('переживает ответ без обязательного bets', () => {
    const vm = mapBets({} as BetListResponseDto, {
      hidden: false,
      placesHidden: false,
      ownOrganizationId: null,
    });

    expect(vm.items).toEqual([]);
  });
});

describe('resolvePrimaryAction', () => {
  it('предлагает создать ставку', () => {
    expect(resolvePrimaryAction({ canSetBet: true, hasMyBet: false, betsHidden: false }).kind).toBe(
      PRIMARY_ACTION.CreateBet,
    );
  });

  it('предлагает изменить ставку', () => {
    expect(resolvePrimaryAction({ canSetBet: true, hasMyBet: true, betsHidden: false }).kind).toBe(
      PRIMARY_ACTION.EditBet,
    );
  });

  it('предлагает смотреть ставки', () => {
    expect(
      resolvePrimaryAction({ canSetBet: false, hasMyBet: false, betsHidden: false }).kind,
    ).toBe(PRIMARY_ACTION.ViewBets);
  });

  it('отключает действие при скрытой истории', () => {
    const action = resolvePrimaryAction({ canSetBet: false, hasMyBet: false, betsHidden: true });

    expect(action.kind).toBe(PRIMARY_ACTION.Unavailable);
    expect(action.disabled).toBe(true);
  });
});
