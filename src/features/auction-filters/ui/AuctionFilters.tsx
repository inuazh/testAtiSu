import { AUC_TYPE_LABELS, AUCTION_STATUS_LABELS } from '@/entities/auction';
import { AUC_TYPE_VALUES, AUCTION_STATUS_VALUES, MOCK_CITIES } from '@/shared/api';
import { Button, Field, Input, Select, type SelectOption } from '@/shared/ui';
import { type AuctionSearch, clearFilters, DEFAULT_PAGE } from '../model/searchParams';

const CITY_OPTIONS: SelectOption[] = MOCK_CITIES.map((city) => ({
  value: city.id,
  label: city.name,
}));

const STATUS_OPTIONS: SelectOption[] = AUCTION_STATUS_VALUES.map((status) => ({
  value: status,
  label: AUCTION_STATUS_LABELS[status],
}));

const AUC_TYPE_OPTIONS: SelectOption[] = AUC_TYPE_VALUES.map((aucType) => ({
  value: aucType,
  label: AUC_TYPE_LABELS[aucType],
}));

const TRISTATE_OPTIONS: SelectOption[] = [
  { value: 'true', label: 'Да' },
  { value: 'false', label: 'Нет' },
];

interface AuctionFiltersProps {
  search: AuctionSearch;
  activeCount: number;
  onChange: (next: AuctionSearch) => void;
}

export function AuctionFilters({ search, activeCount, onChange }: AuctionFiltersProps) {
  const patch = (partial: Partial<AuctionSearch>) => {
    onChange({ ...search, ...partial, page: DEFAULT_PAGE });
  };

  const textValue = (value: string | undefined) => value ?? '';
  const numberValue = (value: number | undefined) => (value === undefined ? '' : String(value));
  const booleanValue = (value: boolean | undefined) => (value === undefined ? '' : String(value));

  const parseOptionalText = (value: string): string | undefined =>
    value.trim() === '' ? undefined : value;

  const parseOptionalNumber = (value: string): number | undefined => {
    if (value.trim() === '') {
      return undefined;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  };

  const parseOptionalBoolean = (value: string): boolean | undefined => {
    if (value === '') {
      return undefined;
    }

    return value === 'true';
  };

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Номер заявки" htmlFor="filter-cargo-num">
          <Input
            id="filter-cargo-num"
            value={textValue(search.cargo_num)}
            placeholder="AU-100000"
            onChange={(event) => patch({ cargo_num: parseOptionalText(event.target.value) })}
          />
        </Field>

        <Field label="Статус" htmlFor="filter-status">
          <Select
            id="filter-status"
            options={STATUS_OPTIONS}
            placeholder="Любой"
            value={textValue(search.status)}
            onChange={(event) =>
              patch({
                status: STATUS_OPTIONS.some((option) => option.value === event.target.value)
                  ? (event.target.value as AuctionSearch['status'])
                  : undefined,
              })
            }
          />
        </Field>

        <Field label="Тип аукциона" htmlFor="filter-auc-type">
          <Select
            id="filter-auc-type"
            options={AUC_TYPE_OPTIONS}
            placeholder="Любой"
            value={textValue(search.auc_type)}
            onChange={(event) =>
              patch({
                auc_type: AUC_TYPE_OPTIONS.some((option) => option.value === event.target.value)
                  ? (event.target.value as AuctionSearch['auc_type'])
                  : undefined,
              })
            }
          />
        </Field>

        <Field label="Несколько статусов" htmlFor="filter-statuses">
          <select
            id="filter-statuses"
            multiple
            size={3}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
            value={search.statuses ?? []}
            onChange={(event) => {
              const selected = [...event.target.selectedOptions].map((option) => option.value);

              patch({
                statuses:
                  selected.length > 0
                    ? (selected as NonNullable<AuctionSearch['statuses']>)
                    : undefined,
              });
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Город погрузки" htmlFor="filter-load-city">
          <Select
            id="filter-load-city"
            options={CITY_OPTIONS}
            placeholder="Любой"
            value={textValue(search.load_city)}
            onChange={(event) => patch({ load_city: parseOptionalText(event.target.value) })}
          />
        </Field>

        <Field label="Город выгрузки" htmlFor="filter-unload-city">
          <Select
            id="filter-unload-city"
            options={CITY_OPTIONS}
            placeholder="Любой"
            value={textValue(search.unload_city)}
            onChange={(event) => patch({ unload_city: parseOptionalText(event.target.value) })}
          />
        </Field>

        <Field label="Погрузка от" htmlFor="filter-load-date-from">
          <Input
            id="filter-load-date-from"
            type="date"
            value={textValue(search.load_date_from)}
            onChange={(event) => patch({ load_date_from: parseOptionalText(event.target.value) })}
          />
        </Field>

        <Field label="Погрузка до" htmlFor="filter-load-date-to">
          <Input
            id="filter-load-date-to"
            type="date"
            value={textValue(search.load_date_to)}
            onChange={(event) => patch({ load_date_to: parseOptionalText(event.target.value) })}
          />
        </Field>

        <Field label="Доступен для ставки" htmlFor="filter-is-available">
          <Select
            id="filter-is-available"
            options={TRISTATE_OPTIONS}
            placeholder="Не важно"
            value={booleanValue(search.is_available)}
            onChange={(event) => patch({ is_available: parseOptionalBoolean(event.target.value) })}
          />
        </Field>

        <Field label="Моя ставка есть" htmlFor="filter-is-bidder">
          <Select
            id="filter-is-bidder"
            options={TRISTATE_OPTIONS}
            placeholder="Не важно"
            value={booleanValue(search.is_bidder)}
            onChange={(event) => patch({ is_bidder: parseOptionalBoolean(event.target.value) })}
          />
        </Field>

        <Field label="Цена от" htmlFor="filter-price-from">
          <Input
            id="filter-price-from"
            type="number"
            min={0}
            value={numberValue(search.price_from)}
            onChange={(event) => patch({ price_from: parseOptionalNumber(event.target.value) })}
          />
        </Field>

        <Field label="Цена до" htmlFor="filter-price-to">
          <Input
            id="filter-price-to"
            type="number"
            min={0}
            value={numberValue(search.price_to)}
            onChange={(event) => patch({ price_to: parseOptionalNumber(event.target.value) })}
          />
        </Field>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {activeCount === 0 ? 'Фильтры не заданы' : `Активных фильтров: ${activeCount}`}
        </p>
        <Button
          variant="secondary"
          size="sm"
          disabled={activeCount === 0}
          onClick={() => onChange(clearFilters(search))}
        >
          Сбросить
        </Button>
      </div>
    </form>
  );
}
