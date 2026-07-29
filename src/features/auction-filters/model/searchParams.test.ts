import { describe, expect, it } from 'vitest';
import { AUC_TYPE, AUCTION_STATUS } from '@/shared/api';
import {
  clearFilters,
  countActiveFilters,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  parseAuctionSearch,
} from './searchParams';

describe('parseAuctionSearch', () => {
  it('подставляет значения по умолчанию для пустого входа', () => {
    expect(parseAuctionSearch({})).toEqual({ page: DEFAULT_PAGE, limit: DEFAULT_LIMIT });
  });

  it('переживает undefined вместо объекта', () => {
    expect(parseAuctionSearch(undefined).page).toBe(DEFAULT_PAGE);
  });

  it('приводит числа из строк', () => {
    const search = parseAuctionSearch({ page: '3', limit: '50' });

    expect(search.page).toBe(3);
    expect(search.limit).toBe(50);
  });

  it('откатывает битую страницу к первой, не роняя остальные поля', () => {
    const search = parseAuctionSearch({ page: 'abc', cargo_num: 'AU-100' });

    expect(search.page).toBe(DEFAULT_PAGE);
    expect(search.cargo_num).toBe('AU-100');
  });

  it('откатывает отрицательную и дробную страницу', () => {
    expect(parseAuctionSearch({ page: -5 }).page).toBe(DEFAULT_PAGE);
    expect(parseAuctionSearch({ page: 1.5 }).page).toBe(DEFAULT_PAGE);
  });

  it('ограничивает limit максимумом', () => {
    expect(parseAuctionSearch({ limit: 500 }).limit).toBe(DEFAULT_LIMIT);
  });

  it('отбрасывает неизвестный статус', () => {
    const search = parseAuctionSearch({ status: 'Unknown', auc_type: AUC_TYPE.Down });

    expect(search.status).toBeUndefined();
    expect(search.auc_type).toBe(AUC_TYPE.Down);
  });

  it('читает statuses из массива и из строки через запятую', () => {
    expect(parseAuctionSearch({ statuses: [AUCTION_STATUS.Trading] }).statuses).toEqual([
      AUCTION_STATUS.Trading,
    ]);
    expect(parseAuctionSearch({ statuses: 'Trading,Finished' }).statuses).toEqual([
      AUCTION_STATUS.Trading,
      AUCTION_STATUS.Finished,
    ]);
  });

  it('отбрасывает statuses целиком, если хотя бы одно значение неизвестно', () => {
    expect(parseAuctionSearch({ statuses: 'Trading,Nope' }).statuses).toBeUndefined();
  });

  it('приводит пустой список statuses к undefined', () => {
    expect(parseAuctionSearch({ statuses: [] }).statuses).toBeUndefined();
  });

  it('различает строковые true и false, а не приводит через Boolean', () => {
    expect(parseAuctionSearch({ is_available: 'true' }).is_available).toBe(true);
    expect(parseAuctionSearch({ is_available: 'false' }).is_available).toBe(false);
    expect(parseAuctionSearch({ is_bidder: true }).is_bidder).toBe(true);
    expect(parseAuctionSearch({ is_bidder: 'нет' }).is_bidder).toBeUndefined();
  });

  it('принимает только даты формата YYYY-MM-DD', () => {
    expect(parseAuctionSearch({ load_date_from: '2026-08-01' }).load_date_from).toBe('2026-08-01');
    expect(parseAuctionSearch({ load_date_from: '01.08.2026' }).load_date_from).toBeUndefined();
  });

  it('отбрасывает отрицательную и нечисловую цену', () => {
    expect(parseAuctionSearch({ price_from: -100 }).price_from).toBeUndefined();
    expect(parseAuctionSearch({ price_to: 'дорого' }).price_to).toBeUndefined();
    expect(parseAuctionSearch({ price_from: '1000' }).price_from).toBe(1000);
  });

  it('обрезает пробелы и отбрасывает пустую строку', () => {
    expect(parseAuctionSearch({ cargo_num: '  AU-1  ' }).cargo_num).toBe('AU-1');
    expect(parseAuctionSearch({ cargo_num: '   ' }).cargo_num).toBeUndefined();
  });

  it('выкидывает неизвестные ключи', () => {
    expect(parseAuctionSearch({ hack: 1 })).toEqual({ page: DEFAULT_PAGE, limit: DEFAULT_LIMIT });
  });
});

describe('countActiveFilters', () => {
  it('не считает пагинацию фильтром', () => {
    expect(countActiveFilters(parseAuctionSearch({ page: 4, limit: 50 }))).toBe(0);
  });

  it('считает только заполненные фильтры', () => {
    const search = parseAuctionSearch({ cargo_num: 'AU-1', is_bidder: true, status: 'Nope' });

    expect(countActiveFilters(search)).toBe(2);
  });
});

describe('clearFilters', () => {
  it('сбрасывает фильтры и страницу, сохраняя размер страницы', () => {
    const search = parseAuctionSearch({ page: 5, limit: 50, cargo_num: 'AU-1' });

    expect(clearFilters(search)).toEqual({ page: DEFAULT_PAGE, limit: 50 });
  });
});
