import { describe, expect, it } from 'vitest';
import { AUCTION_STATUS_CODE, AUCTION_TYPE, TRADING_STATUS } from '@/shared/api';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE, parseAuctionSearch } from '../model/searchParams';
import { buildListRequest } from './buildListRequest';

describe('buildListRequest', () => {
  it('кладёт пагинацию в корень запроса как page/per_page', () => {
    const request = buildListRequest(parseAuctionSearch({}));

    expect(request).toEqual({ page: DEFAULT_PAGE, per_page: DEFAULT_PER_PAGE });
  });

  it('не заводит вложенный объект filters', () => {
    const request = buildListRequest(parseAuctionSearch({ cargo_num: 'AU-1' }));

    expect('filters' in request).toBe(false);
    expect(request.cargo_num).toBe('AU-1');
  });

  it('переносит только заполненные фильтры', () => {
    const request = buildListRequest(
      parseAuctionSearch({ cargo_num: 'AU-1', current_price_from: 1000 }),
    );

    expect(request).toEqual({
      page: DEFAULT_PAGE,
      per_page: DEFAULT_PER_PAGE,
      cargo_num: 'AU-1',
      current_price_from: 1000,
    });
  });

  it('сохраняет false как значимое значение', () => {
    const request = buildListRequest(parseAuctionSearch({ is_available: 'false' }));

    expect(request.is_available).toBe(false);
  });

  it('status уходит массивом строк, statuses — массивом чисел', () => {
    const request = buildListRequest(
      parseAuctionSearch({
        status: [TRADING_STATUS.Leading],
        statuses: [AUCTION_STATUS_CODE.Auction, AUCTION_STATUS_CODE.Finished],
      }),
    );

    expect(request.status).toEqual(['Leading']);
    expect(request.statuses).toEqual([2, 6]);
    expect(request.status?.every((value) => typeof value === 'string')).toBe(true);
    expect(request.statuses?.every((value) => typeof value === 'number')).toBe(true);
  });

  it('не тащит в запрос отброшенные схемой значения', () => {
    const request = buildListRequest(
      parseAuctionSearch({ status: 'Nope', cargo_num: '   ', auc_type: [AUCTION_TYPE.Up] }),
    );

    expect(request.status).toBeUndefined();
    expect(request.cargo_num).toBeUndefined();
    expect(request.auc_type).toEqual([AUCTION_TYPE.Up]);
  });

  it('переносит полный набор фильтров', () => {
    const request = buildListRequest(
      parseAuctionSearch({
        page: 2,
        per_page: 20,
        cargo_num: '00000001059',
        status: [TRADING_STATUS.Leading, TRADING_STATUS.Losing],
        statuses: [AUCTION_STATUS_CODE.Auction],
        auc_type: [AUCTION_TYPE.Down],
        load_city: 'Пермь',
        unload_city: 'Москва',
        load_date_from: '2026-05-26T00:00:00Z',
        load_date_to: '2026-05-31T23:59:59Z',
        is_available: true,
        is_bidder: false,
        current_price_from: 1000,
        current_price_to: 500000,
      }),
    );

    expect(request).toEqual({
      page: 2,
      per_page: 20,
      cargo_num: '00000001059',
      status: ['Leading', 'Losing'],
      statuses: [2],
      auc_type: ['Down'],
      load_city: 'Пермь',
      unload_city: 'Москва',
      load_date_from: '2026-05-26T00:00:00Z',
      load_date_to: '2026-05-31T23:59:59Z',
      is_available: true,
      is_bidder: false,
      current_price_from: 1000,
      current_price_to: 500000,
    });
  });
});
