import { describe, expect, it } from 'vitest';
import { AUC_TYPE, AUCTION_STATUS } from '@/shared/api';
import { DEFAULT_LIMIT, DEFAULT_PAGE, parseAuctionSearch } from '../model/searchParams';
import { buildListRequest } from './buildListRequest';

describe('buildListRequest', () => {
  it('не добавляет filters, когда фильтров нет', () => {
    const request = buildListRequest(parseAuctionSearch({}));

    expect(request).toEqual({ page: DEFAULT_PAGE, limit: DEFAULT_LIMIT });
    expect('filters' in request).toBe(false);
  });

  it('переносит пагинацию из search params', () => {
    const request = buildListRequest(parseAuctionSearch({ page: 3, limit: 50 }));

    expect(request.page).toBe(3);
    expect(request.limit).toBe(50);
  });

  it('кладёт в filters только заполненные поля', () => {
    const request = buildListRequest(parseAuctionSearch({ cargo_num: 'AU-100', price_from: 1000 }));

    expect(request.filters).toEqual({ cargo_num: 'AU-100', price_from: 1000 });
  });

  it('сохраняет false как значимое значение фильтра', () => {
    const request = buildListRequest(parseAuctionSearch({ is_available: 'false' }));

    expect(request.filters).toEqual({ is_available: false });
  });

  it('не тащит в запрос отброшенные схемой значения', () => {
    const request = buildListRequest(
      parseAuctionSearch({ status: 'Nope', cargo_num: '   ', auc_type: AUC_TYPE.Up }),
    );

    expect(request.filters).toEqual({ auc_type: AUC_TYPE.Up });
  });

  it('переносит полный набор фильтров', () => {
    const request = buildListRequest(
      parseAuctionSearch({
        page: 2,
        limit: 20,
        cargo_num: 'AU-1',
        status: AUCTION_STATUS.Trading,
        statuses: [AUCTION_STATUS.Trading, AUCTION_STATUS.Published],
        auc_type: AUC_TYPE.Down,
        load_city: 'msk',
        unload_city: 'spb',
        load_date_from: '2026-08-01',
        load_date_to: '2026-08-31',
        is_available: true,
        is_bidder: false,
        price_from: 1000,
        price_to: 500000,
      }),
    );

    expect(request.filters).toEqual({
      cargo_num: 'AU-1',
      status: AUCTION_STATUS.Trading,
      statuses: [AUCTION_STATUS.Trading, AUCTION_STATUS.Published],
      auc_type: AUC_TYPE.Down,
      load_city: 'msk',
      unload_city: 'spb',
      load_date_from: '2026-08-01',
      load_date_to: '2026-08-31',
      is_available: true,
      is_bidder: false,
      price_from: 1000,
      price_to: 500000,
    });
  });
});
