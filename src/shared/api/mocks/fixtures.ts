import type {
  AucTypeDto,
  AuctionDetailDto,
  AuctionStatusDto,
  BetDto,
  CarrierDto,
  OrganizerDto,
  RoutePointDto,
} from '../dto';
import { AUC_TYPE, AUCTION_STATUS, BODY_TYPE_VALUES, ROUTE_POINT_KIND } from '../enums';
import { CURRENT_CARRIER, recalculate, toPriceWithoutVat } from './betting';
import { MOCK_CITIES } from './cities';
import { createRng, intBetween, pick, pickIndex, roundTo } from './random';
import type { MockAuctionRecord } from './types';

const AUCTIONS_COUNT = 44;
const DAY_MS = 24 * 60 * 60 * 1000;

const HEX_CHARS = '0123456789abcdef'.split('');

const CARGO_NAMES = [
  'Продукты питания',
  'Бытовая техника',
  'Стройматериалы',
  'Мебель в упаковке',
  'Текстиль',
  'Автозапчасти',
  'Бумага и картон',
  'Медикаменты',
  'Пиломатериалы',
  'Кабельная продукция',
  'Замороженные полуфабрикаты',
  'Керамическая плитка',
];

const ORGANIZER_NAMES = [
  'ООО «ТрансЛогистик»',
  'АО «ГрузПоток»',
  'ООО «Северный Путь»',
  'ООО «Магистраль-Сервис»',
  'АО «РегионТранс»',
];

const CARRIER_NAMES = [
  'ООО «АвтоЛайн»',
  'ИП Дорофеев А. В.',
  'ООО «ПутьГруз»',
  'АО «ТрансРейс»',
  'ООО «Экспресс-Карго»',
  'ИП Савельев Н. П.',
  'ООО «ДальнобойТранс»',
];

const LOADING_TYPES = ['Задняя', 'Боковая', 'Верхняя', 'Полная растентовка'];
const PAYMENT_TYPES = ['Безнал с НДС', 'Безнал без НДС', 'Наличными при выгрузке'];

const CANCEL_REASONS = [
  'Ставка отозвана перевозчиком',
  'Не подтверждены документы',
  'Нарушены требования к ТС',
];

interface ForcedCase {
  aucType: AucTypeDto;
  status: AuctionStatusDto;
  betsCount: number;
  myBetRank: 'best' | 'worst' | null;
  canSetBet?: boolean;
  hideBetsHistory?: boolean;
  hidePointsAddressAndContacts?: boolean;
  noViewCargoPrice?: boolean;
  cancelledBet?: boolean;
}

const FORCED_CASES: readonly ForcedCase[] = [
  { aucType: AUC_TYPE.Request, status: AUCTION_STATUS.Trading, betsCount: 0, myBetRank: null },
  {
    aucType: AUC_TYPE.Down,
    status: AUCTION_STATUS.Trading,
    betsCount: 5,
    myBetRank: null,
    hideBetsHistory: true,
  },
  {
    aucType: AUC_TYPE.Up,
    status: AUCTION_STATUS.Trading,
    betsCount: 3,
    myBetRank: null,
    hidePointsAddressAndContacts: true,
  },
  {
    aucType: AUC_TYPE.FixPrice,
    status: AUCTION_STATUS.Published,
    betsCount: 0,
    myBetRank: null,
    noViewCargoPrice: true,
  },
  { aucType: AUC_TYPE.Down, status: AUCTION_STATUS.Finished, betsCount: 4, myBetRank: 'best' },
  { aucType: AUC_TYPE.Up, status: AUCTION_STATUS.Trading, betsCount: 4, myBetRank: 'worst' },
  {
    aucType: AUC_TYPE.Down,
    status: AUCTION_STATUS.Cancelled,
    betsCount: 2,
    myBetRank: null,
    canSetBet: false,
  },
  {
    aucType: AUC_TYPE.Request,
    status: AUCTION_STATUS.Draft,
    betsCount: 0,
    myBetRank: null,
    canSetBet: false,
  },
  { aucType: AUC_TYPE.Down, status: AUCTION_STATUS.Trading, betsCount: 6, myBetRank: 'best' },
  { aucType: AUC_TYPE.Up, status: AUCTION_STATUS.Finished, betsCount: 5, myBetRank: 'worst' },
  {
    aucType: AUC_TYPE.Down,
    status: AUCTION_STATUS.Trading,
    betsCount: 4,
    myBetRank: null,
    cancelledBet: true,
  },
];

const RANDOM_STATUSES: readonly AuctionStatusDto[] = [
  AUCTION_STATUS.Trading,
  AUCTION_STATUS.Trading,
  AUCTION_STATUS.Trading,
  AUCTION_STATUS.Published,
  AUCTION_STATUS.Published,
  AUCTION_STATUS.Finished,
  AUCTION_STATUS.Cancelled,
];

const RANDOM_AUC_TYPES: readonly AucTypeDto[] = [
  AUC_TYPE.Down,
  AUC_TYPE.Down,
  AUC_TYPE.Up,
  AUC_TYPE.Request,
  AUC_TYPE.FixPrice,
];

function makeUuid(rng: () => number): string {
  let raw = '';

  for (let i = 0; i < 32; i += 1) {
    raw += pick(rng, HEX_CHARS);
  }

  return [
    raw.slice(0, 8),
    raw.slice(8, 12),
    `4${raw.slice(13, 16)}`,
    `8${raw.slice(17, 20)}`,
    raw.slice(20, 32),
  ].join('-');
}

function makeRoutePoint(
  rng: () => number,
  cityIndex: number,
  date: Date,
  kind: RoutePointDto['kind'],
): RoutePointDto {
  const city = MOCK_CITIES[cityIndex % MOCK_CITIES.length];

  if (city === undefined) {
    throw new Error('Словарь городов пуст');
  }

  return {
    uuid: makeUuid(rng),
    city,
    address: `ул. ${pick(rng, ['Складская', 'Промышленная', 'Логистическая', 'Заводская'])}, д. ${intBetween(rng, 1, 90)}`,
    date: date.toISOString(),
    kind,
  };
}

function makeOrganizer(rng: () => number, hideContacts: boolean): OrganizerDto {
  return {
    uuid: makeUuid(rng),
    name: pick(rng, ORGANIZER_NAMES),
    inn: String(intBetween(rng, 1000000000, 9999999999)),
    contacts: hideContacts
      ? null
      : [
          {
            name: pick(rng, ['Иванов И.', 'Петрова А.', 'Сидоров К.', 'Ковалёва М.']),
            phone: `+7 (9${intBetween(rng, 10, 99)}) ${intBetween(rng, 100, 999)}-${intBetween(rng, 10, 99)}-${intBetween(rng, 10, 99)}`,
            email: `logist${intBetween(rng, 1, 99)}@example.com`,
          },
        ],
  };
}

function makeCarrier(rng: () => number, name: string): CarrierDto {
  return {
    uuid: makeUuid(rng),
    name,
    inn: String(intBetween(rng, 1000000000, 9999999999)),
  };
}

function makeBetPrices(
  aucType: AucTypeDto,
  startPrice: number,
  step: number,
  count: number,
): number[] {
  const prices: number[] = [];

  for (let i = 0; i < count; i += 1) {
    if (aucType === AUC_TYPE.Down) {
      prices.push(startPrice - step * (i + 1));
    } else if (aucType === AUC_TYPE.Up) {
      prices.push(startPrice + step * (i + 1));
    } else if (aucType === AUC_TYPE.FixPrice) {
      prices.push(startPrice);
    } else {
      prices.push(startPrice - step * i);
    }
  }

  return prices;
}

function buildRecord(index: number, baseDate: number): MockAuctionRecord {
  const rng = createRng(index * 7919 + 13);
  const forced = FORCED_CASES[index];

  const aucType = forced?.aucType ?? pick(rng, RANDOM_AUC_TYPES);
  const status = forced?.status ?? pick(rng, RANDOM_STATUSES);

  const loadCityIndex = pickIndex(rng, MOCK_CITIES.length);
  let unloadCityIndex = pickIndex(rng, MOCK_CITIES.length);

  if (unloadCityIndex === loadCityIndex) {
    unloadCityIndex = (unloadCityIndex + 1) % MOCK_CITIES.length;
  }

  const loadDate = new Date(baseDate + (index - 6) * DAY_MS + intBetween(rng, 6, 18) * 3600_000);
  const transitDays = intBetween(rng, 1, 5);
  const unloadDate = new Date(loadDate.getTime() + transitDays * DAY_MS);

  const points: RoutePointDto[] = [
    makeRoutePoint(rng, loadCityIndex, loadDate, ROUTE_POINT_KIND.Load),
  ];

  if (rng() < 0.3) {
    const midIndex = (loadCityIndex + 3) % MOCK_CITIES.length;
    points.push(
      makeRoutePoint(
        rng,
        midIndex,
        new Date(loadDate.getTime() + Math.floor(transitDays / 2) * DAY_MS),
        ROUTE_POINT_KIND.Unload,
      ),
    );
  }

  points.push(makeRoutePoint(rng, unloadCityIndex, unloadDate, ROUTE_POINT_KIND.Unload));

  const distanceKm = intBetween(rng, 180, 4200);
  const step = roundTo(intBetween(rng, 500, 3000), 500);
  const startPrice = roundTo(distanceKm * intBetween(rng, 28, 62), 500);

  const noViewCargoPrice = forced?.noViewCargoPrice ?? rng() < 0.12;
  const hideBetsHistory = forced?.hideBetsHistory ?? rng() < 0.12;
  const hidePoints = forced?.hidePointsAddressAndContacts ?? rng() < 0.15;

  const isBiddable = status === AUCTION_STATUS.Trading || status === AUCTION_STATUS.Published;
  const canSetBet = forced?.canSetBet ?? isBiddable;

  const detail: AuctionDetailDto = {
    uuid: makeUuid(rng),
    cargo_num: `AU-${String(100000 + index * 37).slice(0, 6)}`,
    auc_type: aucType,
    status,
    points,
    cargo: {
      name: pick(rng, CARGO_NAMES),
      weight: Number((intBetween(rng, 5, 220) / 10).toFixed(1)),
      volume: intBetween(rng, 8, 92),
      body_type: pick(rng, BODY_TYPE_VALUES),
      price: noViewCargoPrice ? null : roundTo(intBetween(rng, 200000, 4000000), 1000),
    },
    trading: {
      can_set_bet: canSetBet,
      current_price: startPrice,
      available_price: null,
      price_per_km: Number((startPrice / distanceKm).toFixed(2)),
      min: null,
      max: null,
      step: aucType === AUC_TYPE.Request || aucType === AUC_TYPE.FixPrice ? null : step,
      trading_status: 'None',
      has_my_bet: false,
      my_bet_price: null,
      finish_at: isBiddable
        ? new Date(baseDate + (index + 2) * DAY_MS + 12 * 3600_000).toISOString()
        : null,
    },
    organizer: makeOrganizer(rng, hidePoints),
    vehicle_requirements: {
      body_types: [pick(rng, BODY_TYPE_VALUES), pick(rng, BODY_TYPE_VALUES)],
      temperature_from: rng() < 0.3 ? intBetween(rng, -20, 0) : null,
      temperature_to: rng() < 0.3 ? intBetween(rng, 1, 12) : null,
      loading_type: pick(rng, LOADING_TYPES),
      comment: rng() < 0.4 ? 'Требуются ремни крепления и коврики' : null,
    },
    payment_conditions: {
      payment_type: pick(rng, PAYMENT_TYPES),
      deferment_days: pick(rng, [0, 3, 7, 14, 30]),
      with_vat: rng() < 0.7,
    },
    restrictions: {
      hide_bets_history: hideBetsHistory,
      hide_points_address_and_contacts: hidePoints,
      no_view_cargo_price: noViewCargoPrice,
    },
    distance_km: distanceKm,
    comment: rng() < 0.35 ? 'Погрузка строго по предварительной заявке' : null,
  };

  if (hidePoints) {
    for (const point of detail.points) {
      point.address = null;
    }
  }

  const betsCount = forced?.betsCount ?? intBetween(rng, 0, 7);
  const prices = makeBetPrices(aucType, startPrice, step, betsCount);
  const myBetRank = forced?.myBetRank ?? (rng() < 0.25 ? 'worst' : null);

  const bets: BetDto[] = prices.map((price, betIndex) => {
    const isMy =
      (myBetRank === 'best' && betIndex === prices.length - 1) ||
      (myBetRank === 'worst' && betIndex === 0);

    return {
      uuid: makeUuid(rng),
      price_with_vat: price,
      price_without_vat: toPriceWithoutVat(price),
      carrier: isMy ? CURRENT_CARRIER : makeCarrier(rng, pick(rng, CARRIER_NAMES)),
      rank: 0,
      is_winner: false,
      is_cancelled: false,
      cancel_reason: null,
      is_my: isMy,
      created_at: new Date(
        loadDate.getTime() - (prices.length - betIndex) * 3600_000,
      ).toISOString(),
    };
  });

  if (forced?.cancelledBet === true) {
    const target = bets[bets.length - 1];

    if (target !== undefined) {
      target.is_cancelled = true;
      target.cancel_reason = pick(rng, CANCEL_REASONS);
    }
  }

  const record: MockAuctionRecord = { detail, bets, startPrice };
  recalculate(record);

  return record;
}

export function createInitialRecords(): MockAuctionRecord[] {
  const baseDate = new Date().setUTCHours(0, 0, 0, 0);
  const records: MockAuctionRecord[] = [];

  for (let index = 0; index < AUCTIONS_COUNT; index += 1) {
    records.push(buildRecord(index, baseDate));
  }

  return records;
}
