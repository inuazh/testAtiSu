import { z } from 'zod';

export interface BetLimits {
  current: number | null;
  available: number | null;
  min: number | null;
  max: number | null;
  step: number | null;
}

const PRICE_PATH = ['price'];

function parsePrice(raw: string): number {
  return Number(raw.replace(',', '.'));
}

export function createBetSchema(limits: BetLimits) {
  return z
    .object({
      price: z
        .string()
        .trim()
        .min(1, 'Введите цену')
        .refine((raw) => Number.isFinite(parsePrice(raw)), 'Цена должна быть числом')
        .transform(parsePrice),
    })
    .superRefine((values, ctx) => {
      const { price } = values;

      if (price <= 0) {
        ctx.addIssue({ code: 'custom', path: PRICE_PATH, message: 'Цена должна быть больше 0' });
        return;
      }

      if (limits.min !== null && price < limits.min) {
        ctx.addIssue({
          code: 'custom',
          path: PRICE_PATH,
          message: `Цена не может быть меньше ${limits.min}`,
        });
      }

      if (limits.max !== null && price > limits.max) {
        ctx.addIssue({
          code: 'custom',
          path: PRICE_PATH,
          message: `Цена не может быть больше ${limits.max}`,
        });
      }

      if (
        limits.step !== null &&
        limits.step > 0 &&
        limits.current !== null &&
        Math.abs(price - limits.current) % limits.step !== 0
      ) {
        ctx.addIssue({
          code: 'custom',
          path: PRICE_PATH,
          message: `Цена должна отличаться от текущей на кратное шагу ${limits.step}`,
        });
      }
    });
}

export type BetSchema = ReturnType<typeof createBetSchema>;
export type BetFormInput = z.input<BetSchema>;
export type BetFormValues = z.output<BetSchema>;
