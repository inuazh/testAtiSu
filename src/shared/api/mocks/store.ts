import type {
  AuctionListRequestDto,
  AuctionListResponseDto,
  AuctionShowResponseDto,
  BetItemDto,
  BetListResponseDto,
  SetBetRequestDto,
  ValidationErrorDto,
  ValidationProblemDto,
} from '../dto';
import { AUCTION_TYPE } from '../enums';
import {
  CURRENT_ORGANIZATION,
  ownActiveBet,
  priceBounds,
  recalculate,
  toPriceNoVat,
} from './betting';
import { createInitialAuctions } from './fixtures';
import { toBetList, toDetail, toListItem } from './projections';
import type { MockAuction } from './types';

export type SetBetResult =
  | { kind: 'ok' }
  | { kind: 'not_found' }
  | { kind: 'validation'; problem: ValidationProblemDto };

const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

let auctions: MockAuction[] = createInitialAuctions();
let nextBetId = 90000;

function findAuction(auctionUuid: string): MockAuction | undefined {
  return auctions.find((auction) => auction.uuid === auctionUuid);
}

function includesText(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

function matches(auction: MockAuction, request: AuctionListRequestDto): boolean {
  const item = toListItem(auction);
  const load = item.route?.load;
  const unload = item.route?.unload;

  if (request.cargo_num !== undefined && !includesText(auction.cargoNum, request.cargo_num)) {
    return false;
  }

  if (request.status !== undefined && request.status.length > 0) {
    if (!request.status.includes(auction.tradingStatus)) {
      return false;
    }
  }

  if (request.statuses !== undefined && request.statuses.length > 0) {
    if (auction.statusCode === null || !request.statuses.includes(auction.statusCode)) {
      return false;
    }
  }

  if (request.auc_type !== undefined && request.auc_type.length > 0) {
    if (!request.auc_type.some((value) => value === auction.aucType)) {
      return false;
    }
  }

  if (request.load_city !== undefined && !includesText(load?.city ?? '', request.load_city)) {
    return false;
  }

  if (request.unload_city !== undefined && !includesText(unload?.city ?? '', request.unload_city)) {
    return false;
  }

  const loadDate = Date.parse(load?.date ?? '');

  if (request.load_date_from !== undefined && loadDate < Date.parse(request.load_date_from)) {
    return false;
  }

  if (request.load_date_to !== undefined && loadDate > Date.parse(request.load_date_to)) {
    return false;
  }

  if (request.is_available !== undefined && request.is_available !== auction.canSetBet) {
    return false;
  }

  if (
    request.is_bidder !== undefined &&
    request.is_bidder !== (ownActiveBet(auction) !== undefined)
  ) {
    return false;
  }

  if (request.is_favorite !== undefined && request.is_favorite !== auction.isFavorite) {
    return false;
  }

  const current = auction.currentPrice ?? auction.startPrice;
  const from = request.current_price_from;
  const to = request.current_price_to;

  if (from !== undefined && from !== null && current < from) {
    return false;
  }

  if (to !== undefined && to !== null && current > to) {
    return false;
  }

  return true;
}

function validationProblem(errors: ValidationErrorDto[]): ValidationProblemDto {
  return {
    code: 'validation_failed',
    title: 'Ошибка валидации',
    message: 'Проверьте правильность заполнения полей',
    trace_id: `trace-${Date.now()}`,
    errors,
  };
}

export const mockStore = {
  reset(): void {
    auctions = createInitialAuctions();
    nextBetId = 90000;
  },

  list(request: AuctionListRequestDto): AuctionListResponseDto {
    const matched = auctions.filter((auction) => matches(auction, request));

    const perPage = Math.min(Math.max(1, request.per_page ?? DEFAULT_PER_PAGE), MAX_PER_PAGE);
    const lastPage = Math.max(1, Math.ceil(matched.length / perPage));
    const currentPage = Math.min(Math.max(1, request.page ?? 1), lastPage);
    const offset = (currentPage - 1) * perPage;
    const pageItems = matched.slice(offset, offset + perPage);

    return {
      data: pageItems.map(toListItem),
      meta: {
        current_page: currentPage,
        from: matched.length === 0 ? 0 : offset + 1,
        last_page: lastPage,
        per_page: perPage,
        to: offset + pageItems.length,
        total: matched.length,
      },
    };
  },

  detail(auctionUuid: string): AuctionShowResponseDto | undefined {
    const auction = findAuction(auctionUuid);

    return auction === undefined ? undefined : toDetail(auction);
  },

  bets(auctionUuid: string): BetListResponseDto | undefined {
    const auction = findAuction(auctionUuid);

    if (auction === undefined) {
      return undefined;
    }

    return { bets: auction.hideBetsHistory ? [] : toBetList(auction) };
  },

  setBet(auctionUuid: string, request: SetBetRequestDto): SetBetResult {
    const auction = findAuction(auctionUuid);

    if (auction === undefined) {
      return { kind: 'not_found' };
    }

    if (!auction.canSetBet) {
      return {
        kind: 'validation',
        problem: validationProblem([
          {
            field: 'trading.can_set_bet',
            message: 'Ставки по этому аукциону недоступны',
            code: 'bets_not_allowed',
          },
        ]),
      };
    }

    const price = request.price;

    if (price === undefined || !Number.isFinite(price) || price <= 0) {
      return {
        kind: 'validation',
        problem: validationProblem([
          { field: 'price', message: 'Цена должна быть больше 0', code: 'price_gt' },
        ]),
      };
    }

    const bounds = priceBounds(auction);

    if (bounds.min !== null && price < bounds.min) {
      return {
        kind: 'validation',
        problem: validationProblem([
          { field: 'price', message: `Цена не может быть меньше ${bounds.min}`, code: 'price_min' },
        ]),
      };
    }

    if (bounds.max !== null && price > bounds.max) {
      return {
        kind: 'validation',
        problem: validationProblem([
          { field: 'price', message: `Цена не может быть больше ${bounds.max}`, code: 'price_max' },
        ]),
      };
    }

    const step = auction.step;
    const current = auction.currentPrice;

    if (
      step !== null &&
      step > 0 &&
      current !== null &&
      auction.aucType !== AUCTION_TYPE.FixPrice &&
      Math.abs(price - current) % step !== 0
    ) {
      return {
        kind: 'validation',
        problem: validationProblem([
          {
            field: 'price',
            message: `Цена должна отличаться от текущей на кратное шагу ${step}`,
            code: 'price_step',
          },
        ]),
      };
    }

    for (const bet of auction.bets) {
      if (bet.organization_id === CURRENT_ORGANIZATION.id && bet.is_rejected !== true) {
        bet.is_rejected = true;
        bet.cancel_reason = 'Заменена новой ставкой';
      }
    }

    nextBetId += 1;

    const bet: BetItemDto = {
      id: nextBetId,
      created_at: new Date().toISOString(),
      auction_id: auction.id,
      subscriber_id: CURRENT_ORGANIZATION.subscriberId,
      contact_name: 'Логист',
      contact_phone: '+7 (900) 000-00-00',
      price_with_vat: price,
      price_no_vat: toPriceNoVat(price),
      organization_id: CURRENT_ORGANIZATION.id,
      organization_inn: CURRENT_ORGANIZATION.inn,
      organization_name: CURRENT_ORGANIZATION.name,
      transporter_comment: null,
      is_rejected: false,
      is_counter: false,
      place: null,
      is_win: false,
      run_number: auction.bets.length + 1,
      cancel_reason: '',
      price_info: {
        price_with_vat: price,
        price_no_vat: toPriceNoVat(price),
        payment_type: auction.paymentForm,
        vat_rate: '20%',
      },
    };

    auction.bets.push(bet);
    recalculate(auction);

    return { kind: 'ok' };
  },
};
