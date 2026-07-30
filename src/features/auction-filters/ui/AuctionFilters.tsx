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
import { Button, CheckboxGroup, Field, Input, Select, type SelectOption } from '@/shared/ui';
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

  const parseOptionalBoolean = (value: string): boolean | undefined =>
    value === '' ? undefined : value === 'true';

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="columns-1 gap-x-4 *:mb-2 *:break-inside-avoid sm:columns-2 lg:columns-3">
        <Field label="Номер заявки" htmlFor="filter-cargo-num">
          <Input
            id="filter-cargo-num"
            value={textValue(search.cargo_num)}
            placeholder="00000001059"
            onChange={(event) => patch({ cargo_num: parseOptionalText(event.target.value) })}
          />
        </Field>

        <Field label="Тип аукциона">
          <CheckboxGroup
            id="filter-auc-type"
            ariaLabel="Тип аукциона"
            options={AUCTION_TYPE_OPTIONS}
            value={search.auc_type ?? []}
            onChange={(selected) =>
              patch({
                auc_type: selected.length > 0 ? (selected as AuctionTypeFilterValue[]) : undefined,
              })
            }
          />
        </Field>

        <Field label="Мой торговый статус">
          <CheckboxGroup
            id="filter-status"
            ariaLabel="Мой торговый статус"
            options={TRADING_STATUS_OPTIONS}
            columns={2}
            value={search.status ?? []}
            onChange={(selected) =>
              patch({ status: selected.length > 0 ? (selected as TradingStatusDto[]) : undefined })
            }
          />
        </Field>

        <Field label="Статус аукциона">
          <CheckboxGroup
            id="filter-statuses"
            ariaLabel="Статус аукциона"
            options={AUCTION_STATUS_OPTIONS}
            columns={2}
            value={(search.statuses ?? []).map(String)}
            onChange={(selected) => {
              const codes = selected.map(Number) as AuctionStatusCode[];

              patch({ statuses: codes.length > 0 ? codes : undefined });
            }}
          />
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

      <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
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
