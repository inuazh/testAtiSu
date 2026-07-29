import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { AuctionDetailVm } from '@/entities/auction';
import { Button, Field, Input, showErrorToast } from '@/shared/ui';
import { useCreateBet } from '../api/useCreateBet';
import { type BetFormInput, type BetFormValues, createBetSchema } from '../model/betSchema';

interface CreateBetFormProps {
  auction: AuctionDetailVm;
  onDone: () => void;
}

export function CreateBetForm({ auction, onDone }: CreateBetFormProps) {
  const limits = auction.trading.limits;
  const schema = useMemo(() => createBetSchema(limits), [limits]);

  const defaultPrice = limits.availablePrice ?? limits.currentPrice;

  const form = useForm<BetFormInput, unknown, BetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      price: defaultPrice === null ? '' : String(defaultPrice),
      with_vat: true,
    },
  });

  const mutation = useCreateBet(auction.uuid, {
    onSuccess: onDone,
    onValidationError: (issues) => {
      let matched = false;

      for (const issue of issues) {
        const field = issue.loc[issue.loc.length - 1];

        if (field === 'price' || field === 'with_vat') {
          form.setError(field, { type: 'server', message: issue.msg });
          matched = true;
        }
      }

      if (!matched) {
        showErrorToast(issues.map((issue) => issue.msg).join('; '));
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
    mutation.mutate({ price: values.price, with_vat: values.with_vat });
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)} noValidate>
      <Field
        label="Цена ставки"
        htmlFor="bet-price"
        error={form.formState.errors.price?.message}
        hint={
          <>
            Доступная цена: {auction.trading.availablePrice} · шаг: {auction.trading.step}
            <br />
            Диапазон: {auction.trading.min} — {auction.trading.max}
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

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="size-4" {...form.register('with_vat')} />
        Цена указана с НДС
      </label>

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
