import {
  AUCTION_STATUS_LABELS,
  AUCTION_TYPE_LABELS,
  TRADING_STATUS_LABELS,
} from '@/entities/auction';
import {
  AUCTION_STATUS_BY_CODE,
  AUCTION_STATUS_CODE_VALUES,
  AUCTION_TYPE_FILTER_VALUES,
  type AuctionStatusCode,
  type AuctionTypeFilterValue,
  MOCK_CITIES,
  TRADING_STATUS_VALUES,
  type TradingStatusDto,
} from '@/shared/api';
import { Button, Field, Input, Select, type SelectOption } from '@/shared/ui';
import {
  type AuctionSearch,
  clearFilters,
  DEFAULT_PAGE,
  fromDateInputValue,
  toDateInputValue,
} from '../model/searchParams';

const CITY_OPTIONS: SelectOption[] = MOCK_CITIES.map((city) => ({
  value: city.name,
  label: city.name,
}));

const TRADING_STATUS_OPTIONS: SelectOption[] = TRADING_STATUS_VALUES.map((status) => ({
  value: status,
  label: TRADING_STATUS_LABELS[status],
}));

const AUCTION_STATUS_OPTIONS: SelectOption[] = AUCTION_STATUS_CODE_VALUES.map((code) => ({
  value: String(code),
  label: AUCTION_STATUS_LABELS[AUCTION_STATUS_BY_CODE[code]],
}));

const AUCTION_TYPE_OPTIONS: SelectOption[] = AUCTION_TYPE_FILTER_VALUES.map((value) => ({
  value,
  label: AUCTION_TYPE_LABELS[value],
}));

const TRISTATE_OPTIONS: SelectOption[] = [
  { value: 'true', label: 'Да' },
  { value: 'false', label: 'Нет' },
];

const MULTI_SELECT_CLASSES =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500';

interface AuctionFiltersProps {
  search: AuctionSearch;
  activeCount: number;
  onChange: (next: AuctionSearch) => void;
}

function selectedValues(element: HTMLSelectElement): string[] {
  return [...element.selectedOptions].map((option) => option.value);
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

  const parseOptionalBoolean = (value: string): boolean | undefined =>
    value === '' ? undefined : value === 'true';

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
            placeholder="00000001059"
            onChange={(event) => patch({ cargo_num: parseOptionalText(event.target.value) })}
          />
        </Field>

        <Field label="Тип аукциона" htmlFor="filter-auc-type">
          <select
            id="filter-auc-type"
            multiple
            size={4}
            className={MULTI_SELECT_CLASSES}
            value={search.auc_type ?? []}
            onChange={(event) => {
              const selected = selectedValues(event.target) as AuctionTypeFilterValue[];

              patch({ auc_type: selected.length > 0 ? selected : undefined });
            }}
          >
            {AUCTION_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Мой торговый статус" htmlFor="filter-status">
          <select
            id="filter-status"
            multiple
            size={4}
            className={MULTI_SELECT_CLASSES}
            value={search.status ?? []}
            onChange={(event) => {
              const selected = selectedValues(event.target) as TradingStatusDto[];

              patch({ status: selected.length > 0 ? selected : undefined });
            }}
          >
            {TRADING_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Статус аукциона" htmlFor="filter-statuses">
          <select
            id="filter-statuses"
            multiple
            size={4}
            className={MULTI_SELECT_CLASSES}
            value={(search.statuses ?? []).map(String)}
            onChange={(event) => {
              const selected = selectedValues(event.target).map(Number) as AuctionStatusCode[];

              patch({ statuses: selected.length > 0 ? selected : undefined });
            }}
          >
            {AUCTION_STATUS_OPTIONS.map((option) => (
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
            value={toDateInputValue(search.load_date_from)}
            onChange={(event) =>
              patch({ load_date_from: fromDateInputValue(event.target.value, false) })
            }
          />
        </Field>

        <Field label="Погрузка до" htmlFor="filter-load-date-to">
          <Input
            id="filter-load-date-to"
            type="date"
            value={toDateInputValue(search.load_date_to)}
            onChange={(event) =>
              patch({ load_date_to: fromDateInputValue(event.target.value, true) })
            }
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

        <Field label="Я участвовал" htmlFor="filter-is-bidder">
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
            value={numberValue(search.current_price_from)}
            onChange={(event) =>
              patch({ current_price_from: parseOptionalNumber(event.target.value) })
            }
          />
        </Field>

        <Field label="Цена до" htmlFor="filter-price-to">
          <Input
            id="filter-price-to"
            type="number"
            min={0}
            value={numberValue(search.current_price_to)}
            onChange={(event) =>
              patch({ current_price_to: parseOptionalNumber(event.target.value) })
            }
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
