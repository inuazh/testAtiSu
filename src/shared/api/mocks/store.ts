import type {
  AuctionListItemDto,
  AuctionListRequestDto,
  AuctionListResponseDto,
  BetDto,
  BetsResponseDto,
  CreateBetRequestDto,
  CreateBetResponseDto,
  ErrorDto,
  ValidationErrorResponseDto,
} from '../dto';
import { AUC_TYPE, ROUTE_POINT_KIND } from '../enums';
import { CURRENT_CARRIER, recalculate, toPriceWithoutVat, toPriceWithVat } from './betting';
import { createInitialRecords } from './fixtures';
import { createRng, pick } from './random';
import type { MockAuctionRecord } from './types';

export type CreateBetResult =
  | { kind: 'ok'; response: CreateBetResponseDto }
  | { kind: 'not_found' }
  | { kind: 'forbidden'; error: ErrorDto }
  | { kind: 'validation'; response: ValidationErrorResponseDto };

let records: MockAuctionRecord[] = createInitialRecords();
const uuidRng = createRng(20260729);

function findRecord(auctionUuid: string): MockAuctionRecord | undefined {
  return records.find((record) => record.detail.uuid === auctionUuid);
}

function toListItem(record: MockAuctionRecord): AuctionListItemDto {
  const { detail } = record;
  const loadPoint = detail.points.find((point) => point.kind === ROUTE_POINT_KIND.Load);
  const unloadPoints = detail.points.filter((point) => point.kind === ROUTE_POINT_KIND.Unload);
  const unloadPoint = unloadPoints[unloadPoints.length - 1];

  if (loadPoint === undefined || unloadPoint === undefined) {
    throw new Error(`У аукциона ${detail.uuid} нет точек погрузки или выгрузки`);
  }

  return {
    uuid: detail.uuid,
    cargo_num: detail.cargo_num,
    auc_type: detail.auc_type,
    status: detail.status,
    load_point: loadPoint,
    unload_point: unloadPoint,
    cargo: detail.cargo,
    trading: detail.trading,
    distance_km: detail.distance_km ?? null,
  };
}

function matchesFilters(item: AuctionListItemDto, request: AuctionListRequestDto): boolean {
  const filters = request.filters;

  if (!filters) {
    return true;
  }

  if (
    filters.cargo_num &&
    !item.cargo_num.toLowerCase().includes(filters.cargo_num.trim().toLowerCase())
  ) {
    return false;
  }

  if (filters.status && item.status !== filters.status) {
    return false;
  }

  if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(item.status)) {
    return false;
  }

  if (filters.auc_type && item.auc_type !== filters.auc_type) {
    return false;
  }

  if (filters.load_city && item.load_point.city.id !== filters.load_city) {
    return false;
  }

  if (filters.unload_city && item.unload_point.city.id !== filters.unload_city) {
    return false;
  }

  const loadDay = item.load_point.date.slice(0, 10);

  if (filters.load_date_from && loadDay < filters.load_date_from) {
    return false;
  }

  if (filters.load_date_to && loadDay > filters.load_date_to) {
    return false;
  }

  if (filters.is_available === true && !item.trading.can_set_bet) {
    return false;
  }

  if (filters.is_available === false && item.trading.can_set_bet) {
    return false;
  }

  if (filters.is_bidder === true && !item.trading.has_my_bet) {
    return false;
  }

  if (filters.is_bidder === false && item.trading.has_my_bet) {
    return false;
  }

  const price = item.trading.current_price;

  if (filters.price_from !== undefined && filters.price_from !== null) {
    if (price === null || price < filters.price_from) {
      return false;
    }
  }

  if (filters.price_to !== undefined && filters.price_to !== null) {
    if (price === null || price > filters.price_to) {
      return false;
    }
  }

  return true;
}

function validationError(field: string, msg: string, type: string): ValidationErrorResponseDto {
  return { detail: [{ loc: ['body', field], msg, type }] };
}

function makeBetUuid(): string {
  const hex = '0123456789abcdef'.split('');
  let raw = '';

  for (let i = 0; i < 32; i += 1) {
    raw += pick(uuidRng, hex);
  }

  return [
    raw.slice(0, 8),
    raw.slice(8, 12),
    `4${raw.slice(13, 16)}`,
    `8${raw.slice(17, 20)}`,
    raw.slice(20, 32),
  ].join('-');
}

export const mockStore = {
  reset(): void {
    records = createInitialRecords();
  },

  list(request: AuctionListRequestDto): AuctionListResponseDto {
    const matched = records.map(toListItem).filter((item) => matchesFilters(item, request));

    const page = Math.max(1, request.page);
    const limit = Math.min(Math.max(1, request.limit), 100);
    const offset = (page - 1) * limit;

    return {
      items: matched.slice(offset, offset + limit),
      total: matched.length,
      page,
      limit,
    };
  },

  detail(auctionUuid: string) {
    return findRecord(auctionUuid)?.detail;
  },

  bets(auctionUuid: string): BetsResponseDto | undefined {
    const record = findRecord(auctionUuid);

    if (!record) {
      return undefined;
    }

    const hidden = record.detail.restrictions.hide_bets_history;
    const participants = new Set(
      record.bets.filter((bet) => !bet.is_cancelled).map((bet) => bet.carrier.uuid),
    );

    return {
      items: hidden ? [] : [...record.bets].sort((a, b) => a.rank - b.rank),
      participants_count: participants.size,
      hide_bets_history: hidden,
    };
  },

  createBet(auctionUuid: string, request: CreateBetRequestDto): CreateBetResult {
    const record = findRecord(auctionUuid);

    if (!record) {
      return { kind: 'not_found' };
    }

    const { trading, auc_type: aucType } = record.detail;

    if (!trading.can_set_bet) {
      return {
        kind: 'forbidden',
        error: { code: 'bets_not_allowed', message: 'Ставки по этому аукциону недоступны' },
      };
    }

    if (!Number.isFinite(request.price) || request.price <= 0) {
      return {
        kind: 'validation',
        response: validationError('price', 'Цена должна быть больше 0', 'value_error.number.gt'),
      };
    }

    const priceWithVat = request.with_vat ? request.price : toPriceWithVat(request.price);

    if (trading.min !== undefined && trading.min !== null && priceWithVat < trading.min) {
      return {
        kind: 'validation',
        response: validationError(
          'price',
          `Цена не может быть меньше ${trading.min}`,
          'value_error.number.ge',
        ),
      };
    }

    if (trading.max !== undefined && trading.max !== null && priceWithVat > trading.max) {
      return {
        kind: 'validation',
        response: validationError(
          'price',
          `Цена не может быть больше ${trading.max}`,
          'value_error.number.le',
        ),
      };
    }

    const step = trading.step;

    if (step !== undefined && step !== null && step > 0 && aucType !== AUC_TYPE.FixPrice) {
      const current = trading.current_price;

      if (current !== null && Math.abs(priceWithVat - current) % step !== 0) {
        return {
          kind: 'validation',
          response: validationError(
            'price',
            `Цена должна отличаться от текущей на кратное шагу ${step}`,
            'value_error.number.step',
          ),
        };
      }
    }

    const now = new Date();

    for (const bet of record.bets) {
      if (bet.is_my === true && !bet.is_cancelled) {
        bet.is_cancelled = true;
        bet.cancel_reason = 'Заменена новой ставкой';
      }
    }

    const bet: BetDto = {
      uuid: makeBetUuid(),
      price_with_vat: priceWithVat,
      price_without_vat: request.with_vat ? toPriceWithoutVat(request.price) : request.price,
      carrier: CURRENT_CARRIER,
      rank: 0,
      is_winner: false,
      is_cancelled: false,
      cancel_reason: null,
      is_my: true,
      created_at: now.toISOString(),
    };

    record.bets.push(bet);
    recalculate(record);

    return { kind: 'ok', response: { bet, trading: record.detail.trading } };
  },
};
