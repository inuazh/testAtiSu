import { describe, expect, it } from 'vitest';
import { type BetLimits, createBetSchema } from './betSchema';

const noLimits: BetLimits = { current: null, available: null, min: null, max: null, step: null };

const downAuction: BetLimits = {
  current: 100000,
  available: 97500,
  min: 56500,
  max: 97500,
  step: 2500,
};

function validate(limits: BetLimits, price: string) {
  return createBetSchema(limits).safeParse({ price });
}

function firstError(limits: BetLimits, price: string): string | undefined {
  const result = validate(limits, price);

  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('createBetSchema', () => {
  it('требует заполнить цену', () => {
    expect(firstError(noLimits, '')).toBe('Введите цену');
    expect(firstError(noLimits, '   ')).toBe('Введите цену');
  });

  it('требует число', () => {
    expect(firstError(noLimits, 'дорого')).toBe('Цена должна быть числом');
  });

  it('принимает запятую как десятичный разделитель', () => {
    const result = validate(noLimits, '1000,5');

    expect(result.success).toBe(true);
    expect(result.data?.price).toBe(1000.5);
  });

  it('требует цену больше 0', () => {
    expect(firstError(noLimits, '0')).toBe('Цена должна быть больше 0');
    expect(firstError(noLimits, '-100')).toBe('Цена должна быть больше 0');
  });

  it('привязывает ошибку к полю price', () => {
    const result = validate(noLimits, '0');

    expect(result.error?.issues[0]?.path).toEqual(['price']);
  });

  it('отдаёт только price — with_vat в SetBetRequest нет', () => {
    const result = validate(downAuction, '97500');

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ price: 97500 });
  });

  it('проверяет min и max из trading.price', () => {
    expect(firstError(downAuction, '50000')).toBe('Цена не может быть меньше 56500');
    expect(firstError(downAuction, '99000')).toBe('Цена не может быть больше 97500');
  });

  it('проверяет кратность шагу относительно текущей цены', () => {
    expect(firstError(downAuction, '96000')).toBe(
      'Цена должна отличаться от текущей на кратное шагу 2500',
    );
    expect(validate(downAuction, '95000').success).toBe(true);
  });

  it('игнорирует границы, если схема их не прислала', () => {
    expect(validate(noLimits, '123456').success).toBe(true);
  });

  it('не проверяет шаг без текущей цены', () => {
    expect(validate({ ...noLimits, step: 2500 }, '1234').success).toBe(true);
  });
});
