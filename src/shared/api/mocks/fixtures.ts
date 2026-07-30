import type {
  AuctionStatusDto,
  AuctionTypeDto,
  BetItemDto,
  BidMeasurementTypeDto,
  ContactDto,
} from '../dto';
import {
  AUCTION_STATUS,
  AUCTION_STATUS_CODE,
  AUCTION_TYPE,
  type AuctionStatusCode,
  BID_MEASUREMENT_TYPE,
  OPERATION_TYPE,
  PAYMENT_DELAY_TYPE,
  TRADING_STATUS,
} from '../enums';
import { CURRENT_ORGANIZATION, recalculate, toPriceNoVat } from './betting';
import { MOCK_CITIES } from './cities';
import { createRng, intBetween, pick, pickIndex, roundTo } from './random';
import type { MockAuction, MockOrganization, MockRoutePoint } from './types';

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

const BODY_TYPES = ['тентованный', 'рефрижератор', 'изотерм', 'фургон', 'открытый', 'контейнер'];
const PACKAGE_NAMES = ['Паллеты', 'Коробки', 'Биг-бэги', 'Навалом', 'Рулоны'];

const ORGANIZATION_NAMES = [
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

const CONTACT_NAMES = ['Иванов И. И.', 'Петрова А. С.', 'Сидоров К. П.', 'Ковалёва М. Н.'];
const PAYMENT_FORMS = ['Безналичный расчёт с НДС', 'Безналичный расчёт без НДС', 'Наличные'];
const PAYMENT_CONDITIONS = ['Оплата по оригиналам документов', 'Оплата по скан-копиям', null];
const CANCEL_REASONS = [
  'Ставка отозвана перевозчиком',
  'Не подтверждены документы',
  'Нарушены требования к ТС',
];

interface ForcedCase {
  aucType: AuctionTypeDto;
  status: AuctionStatusDto;
  statusCode: AuctionStatusCode | null;
  betsCount: number;
  ownBet: 'best' | 'worst' | null;
  canSetBet?: boolean;
  hideBetsHistory?: boolean;
  hidePlaces?: boolean;
  hidePointsAddressAndContacts?: boolean;
  noViewCargoPrice?: boolean;
  rejectedBet?: boolean;
}

const FORCED_CASES: readonly ForcedCase[] = [
  {
    aucType: AUCTION_TYPE.Request,
    status: AUCTION_STATUS.Auction,
    statusCode: AUCTION_STATUS_CODE.Auction,
    betsCount: 0,
    ownBet: null,
  },
  {
    aucType: AUCTION_TYPE.Down,
    status: AUCTION_STATUS.Auction,
    statusCode: AUCTION_STATUS_CODE.Auction,
    betsCount: 5,
    ownBet: null,
    hideBetsHistory: true,
  },
  {
    aucType: AUCTION_TYPE.Up,
    status: AUCTION_STATUS.Auction,
    statusCode: AUCTION_STATUS_CODE.Auction,
    betsCount: 3,
    ownBet: null,
    hidePointsAddressAndContacts: true,
  },
  {
    aucType: AUCTION_TYPE.FixPrice,
    status: AUCTION_STATUS.Planning,
    statusCode: AUCTION_STATUS_CODE.Planning,
    betsCount: 0,
    ownBet: null,
    noViewCargoPrice: true,
  },
  {
    aucType: AUCTION_TYPE.Down,
    status: AUCTION_STATUS.Finished,
    statusCode: AUCTION_STATUS_CODE.Finished,
    betsCount: 4,
    ownBet: 'best',
  },
  {
    aucType: AUCTION_TYPE.Up,
    status: AUCTION_STATUS.Auction,
    statusCode: AUCTION_STATUS_CODE.Auction,
    betsCount: 4,
    ownBet: 'worst',
  },
  {
    aucType: AUCTION_TYPE.Down,
    status: AUCTION_STATUS.Canceled,
    statusCode: null,
    betsCount: 2,
    ownBet: null,
    canSetBet: false,
  },
  {
    aucType: AUCTION_TYPE.Request,
    status: AUCTION_STATUS.Stopped,
    statusCode: AUCTION_STATUS_CODE.Stopped,
    betsCount: 0,
    ownBet: null,
    canSetBet: false,
  },
  {
    aucType: AUCTION_TYPE.Down,
    status: AUCTION_STATUS.Auction,
    statusCode: AUCTION_STATUS_CODE.Auction,
    betsCount: 6,
    ownBet: 'best',
  },
  {
    aucType: AUCTION_TYPE.Up,
    status: AUCTION_STATUS.Finished,
    statusCode: AUCTION_STATUS_CODE.Finished,
    betsCount: 5,
    ownBet: 'worst',
  },
  {
    aucType: AUCTION_TYPE.Down,
    status: AUCTION_STATUS.Auction,
    statusCode: AUCTION_STATUS_CODE.Auction,
    betsCount: 4,
    ownBet: null,
    rejectedBet: true,
  },
  {
    aucType: AUCTION_TYPE.Down,
    status: AUCTION_STATUS.Auction,
    statusCode: AUCTION_STATUS_CODE.Auction,
    betsCount: 4,
    ownBet: null,
    hidePlaces: true,
  },
  {
    aucType: AUCTION_TYPE.Unknown,
    status: AUCTION_STATUS.Unknown,
    statusCode: null,
    betsCount: 1,
    ownBet: null,
    canSetBet: false,
  },
];

const RANDOM_STATUSES: readonly { status: AuctionStatusDto; code: AuctionStatusCode | null }[] = [
  { status: AUCTION_STATUS.Auction, code: AUCTION_STATUS_CODE.Auction },
  { status: AUCTION_STATUS.Auction, code: AUCTION_STATUS_CODE.Auction },
  { status: AUCTION_STATUS.Auction, code: AUCTION_STATUS_CODE.Auction },
  { status: AUCTION_STATUS.Planning, code: AUCTION_STATUS_CODE.Planning },
  { status: AUCTION_STATUS.DeterminateWinner, code: AUCTION_STATUS_CODE.DeterminateWinner },
  { status: AUCTION_STATUS.WaitDeal, code: AUCTION_STATUS_CODE.WaitDeal },
  { status: AUCTION_STATUS.InProgress, code: AUCTION_STATUS_CODE.InProgress },
  { status: AUCTION_STATUS.Finished, code: AUCTION_STATUS_CODE.Finished },
  { status: AUCTION_STATUS.Stopped, code: AUCTION_STATUS_CODE.Stopped },
  { status: AUCTION_STATUS.Canceled, code: null },
];

const RANDOM_AUC_TYPES: readonly AuctionTypeDto[] = [
  AUCTION_TYPE.Down,
  AUCTION_TYPE.Down,
  AUCTION_TYPE.Up,
  AUCTION_TYPE.Request,
  AUCTION_TYPE.FixPrice,
];

function makeUuid(rng: () => number): string {
  let raw = '';

  for (let index = 0; index < 32; index += 1) {
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

function makePhone(rng: () => number): string {
  return `+7 (9${intBetween(rng, 10, 99)}) ${intBetween(rng, 100, 999)}-${intBetween(rng, 10, 99)}-${intBetween(rng, 10, 99)}`;
}

function makeOrganization(rng: () => number, index: number, isHide: boolean): MockOrganization {
  return {
    subscriberId: 100000 + index,
    subscriberCode: `SUB-${100000 + index}`,
    infobaseCode: `IB-${intBetween(rng, 10, 99)}`,
    id: 200000 + index,
    name: pick(rng, ORGANIZATION_NAMES),
    inn: String(intBetween(rng, 1000000000, 9999999999)),
    kpp: `${intBetween(rng, 100000000, 999999999)}`,
    isHide,
  };
}

function makeRoutePoint(
  rng: () => number,
  rowNum: number,
  cityIndex: number,
  date: Date,
  opType: MockRoutePoint['opType'],
): MockRoutePoint {
  const city = MOCK_CITIES[cityIndex % MOCK_CITIES.length];

  if (city === undefined) {
    throw new Error('Словарь городов пуст');
  }

  const end = new Date(date.getTime() + intBetween(rng, 2, 8) * 3600_000);

  return {
    rowNum,
    opType,
    startDate: date.toISOString(),
    endDate: end.toISOString(),
    comment: rng() < 0.3 ? 'Строго по предварительной заявке' : null,
    contractor: pick(rng, ORGANIZATION_NAMES),
    contractorInn: String(intBetween(rng, 1000000000, 9999999999)),
    cityName: city.name,
    cityFullName: city.fullName,
    cityGcId: city.gcId,
    loadingAddress: `ул. ${pick(rng, ['Складская', 'Промышленная', 'Логистическая', 'Заводская'])}, д. ${intBetween(rng, 1, 90)}`,
    lon: Number((30 + rng() * 60).toFixed(6)),
    lat: Number((45 + rng() * 20).toFixed(6)),
    cargoName: pick(rng, CARGO_NAMES),
    packageName: pick(rng, PACKAGE_NAMES),
    weight: Number((intBetween(rng, 5, 220) / 10).toFixed(1)),
    volume: intBetween(rng, 8, 92),
    contactName: pick(rng, CONTACT_NAMES),
    contactPhone: makePhone(rng),
  };
}

function makeBetPrices(
  aucType: AuctionTypeDto,
  startPrice: number,
  step: number,
  count: number,
): number[] {
  const prices: number[] = [];

  for (let index = 0; index < count; index += 1) {
    if (aucType === AUCTION_TYPE.Down) {
      prices.push(startPrice - step * (index + 1));
    } else if (aucType === AUCTION_TYPE.Up) {
      prices.push(startPrice + step * (index + 1));
    } else if (aucType === AUCTION_TYPE.FixPrice) {
      prices.push(startPrice);
    } else {
      prices.push(startPrice - step * index);
    }
  }

  return prices;
}

function buildAuction(index: number, baseDate: number): MockAuction {
  const rng = createRng(index * 7919 + 13);
  const forced = FORCED_CASES[index];

  const aucType = forced?.aucType ?? pick(rng, RANDOM_AUC_TYPES);
  const statusPair = forced
    ? { status: forced.status, code: forced.statusCode }
    : pick(rng, RANDOM_STATUSES);

  const loadCityIndex = pickIndex(rng, MOCK_CITIES.length);
  let unloadCityIndex = pickIndex(rng, MOCK_CITIES.length);

  if (unloadCityIndex === loadCityIndex) {
    unloadCityIndex = (unloadCityIndex + 1) % MOCK_CITIES.length;
  }

  const loadDate = new Date(baseDate + (index - 6) * DAY_MS + intBetween(rng, 6, 18) * 3600_000);
  const transitDays = intBetween(rng, 1, 5);
  const unloadDate = new Date(loadDate.getTime() + transitDays * DAY_MS);

  const points: MockRoutePoint[] = [
    makeRoutePoint(rng, 1, loadCityIndex, loadDate, OPERATION_TYPE.Loading),
  ];

  if (rng() < 0.3) {
    points.push(
      makeRoutePoint(
        rng,
        2,
        (loadCityIndex + 3) % MOCK_CITIES.length,
        new Date(loadDate.getTime() + Math.floor(transitDays / 2) * DAY_MS),
        OPERATION_TYPE.Unloading,
      ),
    );
  }

  points.push(
    makeRoutePoint(rng, points.length + 1, unloadCityIndex, unloadDate, OPERATION_TYPE.Unloading),
  );

  const distance = intBetween(rng, 180, 4200);
  const step = roundTo(intBetween(rng, 500, 3000), 500);
  const startPrice = roundTo(distance * intBetween(rng, 28, 62), 500);

  const hidePoints = forced?.hidePointsAddressAndContacts ?? rng() < 0.15;
  const isBiddable =
    statusPair.status === AUCTION_STATUS.Auction || statusPair.status === AUCTION_STATUS.Planning;

  const bidMeasurementType: BidMeasurementTypeDto =
    rng() < 0.2 ? BID_MEASUREMENT_TYPE.PerKm : BID_MEASUREMENT_TYPE.PerRoute;

  const contacts: ContactDto[] = hidePoints
    ? []
    : [
        {
          name: pick(rng, CONTACT_NAMES),
          phone: makePhone(rng),
          work_phone: makePhone(rng),
          uid: makeUuid(rng),
          email: `logist${intBetween(rng, 1, 99)}@example.com`,
        },
      ];

  const auctionUuid = makeUuid(rng);

  const auction: MockAuction = {
    id: 1000 + index,
    uuid: auctionUuid,
    cargoNum: String(1000000 + index * 37).padStart(11, '0'),
    cargoDate: loadDate.toISOString(),
    orderUid: auctionUuid,
    createdAt: new Date(baseDate - intBetween(rng, 1, 20) * DAY_MS).toISOString(),
    aucType,
    status: statusPair.status,
    statusCode: statusPair.code,
    startTime: new Date(baseDate - DAY_MS).toISOString(),
    stopTime: new Date(baseDate + (index + 2) * DAY_MS + 12 * 3600_000).toISOString(),
    bidMeasurementType,
    canSetBet: forced?.canSetBet ?? isBiddable,
    allowCounterBets: rng() < 0.3,
    hideBetsHistory: forced?.hideBetsHistory ?? rng() < 0.12,
    hidePlaces: forced?.hidePlaces ?? rng() < 0.12,
    noViewCargoPrice: forced?.noViewCargoPrice ?? rng() < 0.12,
    hidePointsAddressAndContacts: hidePoints,
    isFavorite: rng() < 0.2,
    organization: makeOrganization(rng, index, hidePoints),
    contacts,
    points,
    cargoPrice: roundTo(intBetween(rng, 200000, 4000000), 1000),
    bodyType: pick(rng, BODY_TYPES),
    truckCount: intBetween(rng, 1, 4),
    isInternational: rng() < 0.15,
    containered: rng() < 0.2,
    tempFrom: rng() < 0.3 ? intBetween(rng, -20, 0) : null,
    tempTo: rng() < 0.3 ? intBetween(rng, 1, 12) : null,
    paymentForm: pick(rng, PAYMENT_FORMS),
    paymentCondition: pick(rng, PAYMENT_CONDITIONS),
    paymentDelay: pick(rng, [0, 3, 7, 14, 30]),
    paymentDelayType: rng() < 0.5 ? PAYMENT_DELAY_TYPE.CalendarDays : PAYMENT_DELAY_TYPE.WorkDays,
    currencyCode: 'RUB',
    distance,
    startPrice,
    step: aucType === AUCTION_TYPE.Request || aucType === AUCTION_TYPE.FixPrice ? null : step,
    bets: [],
    currentPrice: startPrice,
    tradingStatus: TRADING_STATUS.NotParticipating,
  };

  const betsCount = forced?.betsCount ?? intBetween(rng, 0, 7);
  const prices = makeBetPrices(aucType, startPrice, step, betsCount);
  const ownBetSlot = forced?.ownBet ?? (rng() < 0.25 ? 'worst' : null);

  auction.bets = prices.map((price, betIndex) => {
    const isOwn =
      (ownBetSlot === 'best' && betIndex === prices.length - 1) ||
      (ownBetSlot === 'worst' && betIndex === 0);
    const org = isOwn ? CURRENT_ORGANIZATION : makeOrganization(rng, 500 + betIndex, false);

    const bet: BetItemDto = {
      id: 50000 + index * 100 + betIndex,
      created_at: new Date(
        loadDate.getTime() - (prices.length - betIndex) * 3600_000,
      ).toISOString(),
      auction_id: auction.id,
      subscriber_id: org.subscriberId,
      contact_name: pick(rng, CONTACT_NAMES),
      contact_phone: makePhone(rng),
      price_with_vat: price,
      price_no_vat: toPriceNoVat(price),
      organization_id: org.id,
      organization_inn: org.inn,
      organization_name: isOwn ? org.name : pick(rng, CARRIER_NAMES),
      transporter_comment: rng() < 0.2 ? 'Готовы подать машину в день погрузки' : null,
      is_rejected: false,
      is_counter: false,
      place: null,
      is_win: false,
      run_number: betIndex + 1,
      cancel_reason: '',
      price_info: {
        price_with_vat: price,
        price_no_vat: toPriceNoVat(price),
        payment_type: auction.paymentForm,
        vat_rate: '20%',
      },
    };

    return bet;
  });

  if (forced?.rejectedBet === true) {
    const target = auction.bets[auction.bets.length - 1];

    if (target !== undefined) {
      target.is_rejected = true;
      target.cancel_reason = pick(rng, CANCEL_REASONS);
    }
  }

  recalculate(auction);

  return auction;
}

export function createInitialAuctions(): MockAuction[] {
  const baseDate = new Date().setUTCHours(0, 0, 0, 0);
  const auctions: MockAuction[] = [];

  for (let index = 0; index < AUCTIONS_COUNT; index += 1) {
    auctions.push(buildAuction(index, baseDate));
  }

  return auctions;
}
