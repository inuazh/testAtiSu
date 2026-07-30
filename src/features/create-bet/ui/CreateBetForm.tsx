import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { AuctionDetailVm } from '@/entities/auction';
import { Button, Field, Input, showErrorToast } from '@/shared/ui';
import { useSetBet } from '../api/useSetBet';
import { type BetFormInput, type BetFormValues, createBetSchema } from '../model/betSchema';

interface CreateBetFormProps {
  auction: AuctionDetailVm;
  onDone: () => void;
}

function lastPathSegment(field: string): string {
  const segments = field.split('.');

  return segments[segments.length - 1] ?? field;
}

export function CreateBetForm({ auction, onDone }: CreateBetFormProps) {
  const limits = auction.trading.limits;
  const schema = useMemo(() => createBetSchema(limits), [limits]);
  const defaultPrice = limits.available ?? limits.current;

  const form = useForm<BetFormInput, unknown, BetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { price: defaultPrice === null ? '' : String(defaultPrice) },
  });

  const mutation = useSetBet(auction.uuid, {
    onSuccess: onDone,
    onValidationError: (errors) => {
      let matched = false;

      for (const error of errors) {
        if (lastPathSegment(error.field ?? '') === 'price') {
          form.setError('price', { type: 'server', message: error.message });
          matched = true;
        }
      }

      if (!matched) {
        showErrorToast(errors.map((error) => error.message).join('; '));
      }
    },
  });

  if (!auction.trading.canSetBet) {
    return (
      <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        Ставки по этому аукциону недоступны.
      </p>
    );
  }

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({ price: values.price });
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)} noValidate>
      <Field
        label="Цена ставки, с НДС"
        htmlFor="bet-price"
        error={form.formState.errors.price?.message}
        hint={
          <>
            Доступная цена: {auction.trading.availablePrice.withVat} (
            {auction.trading.availablePrice.noVat} без НДС)
            <br />
            Шаг: {auction.trading.step.withVat} · диапазон: {auction.trading.minPrice.withVat} —{' '}
            {auction.trading.maxPrice.withVat}
          </>
        }
      >
        <Input
          id="bet-price"
          inputMode="decimal"
          autoComplete="off"
          invalid={form.formState.errors.price !== undefined}
          {...form.register('price')}
        />
      </Field>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Отправляем…' : 'Отправить ставку'}
        </Button>
        <Button variant="secondary" onClick={onDone} disabled={mutation.isPending}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
