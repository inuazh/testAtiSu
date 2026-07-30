import { describe, expect, it } from 'vitest';
import { AUCTION_STATUS_CODE, AUCTION_TYPE, TRADING_STATUS } from '@/shared/api';
import {
  clearFilters,
  countActiveFilters,
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  fromDateInputValue,
  parseAuctionSearch,
  toDateInputValue,
} from './searchParams';

describe('parseAuctionSearch', () => {
  it('подставляет значения по умолчанию для пустого входа', () => {
    expect(parseAuctionSearch({})).toEqual({ page: DEFAULT_PAGE, per_page: DEFAULT_PER_PAGE });
  });

  it('переживает undefined вместо объекта', () => {
    expect(parseAuctionSearch(undefined).page).toBe(DEFAULT_PAGE);
  });

  it('читает per_page, а не limit', () => {
    expect(parseAuctionSearch({ per_page: '50' }).per_page).toBe(50);
    expect(parseAuctionSearch({ limit: 50 }).per_page).toBe(DEFAULT_PER_PAGE);
  });

  it('откатывает битую страницу, не роняя остальные поля', () => {
    const search = parseAuctionSearch({ page: 'abc', cargo_num: '00000001059' });

    expect(search.page).toBe(DEFAULT_PAGE);
    expect(search.cargo_num).toBe('00000001059');
  });

  it('ограничивает per_page максимумом', () => {
    expect(parseAuctionSearch({ per_page: 500 }).per_page).toBe(DEFAULT_PER_PAGE);
  });

  it('status — массив строковых торговых статусов', () => {
    const search = parseAuctionSearch({
      status: [TRADING_STATUS.Leading, TRADING_STATUS.Losing],
    });

    expect(search.status).toEqual([TRADING_STATUS.Leading, TRADING_STATUS.Losing]);
  });

  it('status читается и из строки через запятую', () => {
    expect(parseAuctionSearch({ status: 'Leading,Winner' }).status).toEqual([
      TRADING_STATUS.Leading,
      TRADING_STATUS.Winner,
    ]);
  });

  it('status отбрасывается целиком при неизвестном значении', () => {
    expect(parseAuctionSearch({ status: 'Leading,Nope' }).status).toBeUndefined();
  });

  it('statuses — массив числовых кодов статуса аукциона', () => {
    const search = parseAuctionSearch({ statuses: [AUCTION_STATUS_CODE.Auction] });

    expect(search.statuses).toEqual([2]);
  });

  it('statuses приводит строку с числами', () => {
    expect(parseAuctionSearch({ statuses: '2,6' }).statuses).toEqual([2, 6]);
  });

  it('оборачивает одиночное значение из URL в массив', () => {
    expect(parseAuctionSearch({ statuses: 2 }).statuses).toEqual([2]);
    expect(parseAuctionSearch({ status: 'Leading' }).status).toEqual([TRADING_STATUS.Leading]);
    expect(parseAuctionSearch({ auc_type: 'Down' }).auc_type).toEqual([AUCTION_TYPE.Down]);
  });

  it('statuses не принимает строковые статусы аукциона', () => {
    expect(parseAuctionSearch({ statuses: ['Auction'] }).statuses).toBeUndefined();
  });

  it('statuses отбрасывает коды вне диапазона 1-7', () => {
    expect(parseAuctionSearch({ statuses: [8] }).statuses).toBeUndefined();
    expect(parseAuctionSearch({ statuses: [0] }).statuses).toBeUndefined();
  });

  it('status и statuses не пересекаются по значениям', () => {
    const search = parseAuctionSearch({ status: ['Leading'], statuses: [2] });

    expect(search.status).toEqual([TRADING_STATUS.Leading]);
    expect(search.statuses).toEqual([2]);
  });

  it('auc_type — массив', () => {
    expect(parseAuctionSearch({ auc_type: [AUCTION_TYPE.Down] }).auc_type).toEqual([
      AUCTION_TYPE.Down,
    ]);
    expect(parseAuctionSearch({ auc_type: 'Down,Up' }).auc_type).toEqual([
      AUCTION_TYPE.Down,
      AUCTION_TYPE.Up,
    ]);
  });

  it('auc_type не принимает Unknown — его нет в фильтре схемы', () => {
    expect(parseAuctionSearch({ auc_type: ['Unknown'] }).auc_type).toBeUndefined();
  });

  it('пустой список приводится к undefined', () => {
    expect(parseAuctionSearch({ status: [], statuses: [], auc_type: [] })).toEqual({
      page: DEFAULT_PAGE,
      per_page: DEFAULT_PER_PAGE,
    });
  });

  it('различает строковые true и false', () => {
    expect(parseAuctionSearch({ is_available: 'true' }).is_available).toBe(true);
    expect(parseAuctionSearch({ is_available: 'false' }).is_available).toBe(false);
    expect(parseAuctionSearch({ is_bidder: 'нет' }).is_bidder).toBeUndefined();
  });

  it('принимает только ISO 8601 со смещением', () => {
    expect(parseAuctionSearch({ load_date_from: '2026-05-26T15:30:00+03:00' }).load_date_from).toBe(
      '2026-05-26T15:30:00+03:00',
    );
    expect(parseAuctionSearch({ load_date_from: '2026-05-26T15:30:00Z' }).load_date_from).toBe(
      '2026-05-26T15:30:00Z',
    );
    expect(parseAuctionSearch({ load_date_from: '2026-05-26' }).load_date_from).toBeUndefined();
    expect(parseAuctionSearch({ load_date_to: '26.05.2026' }).load_date_to).toBeUndefined();
  });

  it('отбрасывает отрицательную и нечисловую цену', () => {
    expect(parseAuctionSearch({ current_price_from: -100 }).current_price_from).toBeUndefined();
    expect(parseAuctionSearch({ current_price_to: 'дорого' }).current_price_to).toBeUndefined();
    expect(parseAuctionSearch({ current_price_from: '1000' }).current_price_from).toBe(1000);
  });

  it('выкидывает неизвестные ключи', () => {
    expect(parseAuctionSearch({ hack: 1 })).toEqual({
      page: DEFAULT_PAGE,
      per_page: DEFAULT_PER_PAGE,
    });
  });
});

describe('countActiveFilters', () => {
  it('не считает пагинацию фильтром', () => {
    expect(countActiveFilters(parseAuctionSearch({ page: 4, per_page: 50 }))).toBe(0);
  });

  it('считает только заполненные фильтры', () => {
    const search = parseAuctionSearch({ cargo_num: 'AU-1', is_bidder: true, status: 'Nope' });

    expect(countActiveFilters(search)).toBe(2);
  });
});

describe('clearFilters', () => {
  it('сбрасывает фильтры и страницу, сохраняя размер страницы', () => {
    const search = parseAuctionSearch({ page: 5, per_page: 50, cargo_num: 'AU-1' });

    expect(clearFilters(search)).toEqual({ page: DEFAULT_PAGE, per_page: 50 });
  });
});

describe('преобразование дат для поля ввода', () => {
  it('обрезает ISO до формата поля', () => {
    expect(toDateInputValue('2026-05-26T15:30:00+03:00')).toBe('2026-05-26');
    expect(toDateInputValue(undefined)).toBe('');
  });

  it('разворачивает дату в ISO со смещением', () => {
    expect(fromDateInputValue('2026-05-26', false)).toBe('2026-05-26T00:00:00Z');
    expect(fromDateInputValue('2026-05-26', true)).toBe('2026-05-26T23:59:59Z');
    expect(fromDateInputValue('  ', false)).toBeUndefined();
  });

  it('результат разворачивания проходит валидацию схемы', () => {
    const value = fromDateInputValue('2026-05-26', true);

    expect(parseAuctionSearch({ load_date_to: value }).load_date_to).toBe(value);
  });
});
