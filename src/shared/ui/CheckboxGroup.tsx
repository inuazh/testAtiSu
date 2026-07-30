import type { SelectOption } from './Select';

interface CheckboxGroupProps {
  id: string;
  ariaLabel: string;
  options: readonly SelectOption[];
  value: readonly string[];
  onChange: (next: string[]) => void;
  columns?: 1 | 2;
}

const COLUMN_CLASSES: Record<1 | 2, string> = {
  1: 'columns-1',
  2: 'columns-2 gap-x-3',
};

export function CheckboxGroup({
  id,
  ariaLabel,
  options,
  value,
  onChange,
  columns = 1,
}: CheckboxGroupProps) {
  const toggle = (optionValue: string, checked: boolean) => {
    const next = checked ? [...value, optionValue] : value.filter((item) => item !== optionValue);

    onChange(options.filter((option) => next.includes(option.value)).map((option) => option.value));
  };

  return (
    <fieldset
      id={id}
      aria-label={ariaLabel}
      className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 focus-within:border-slate-500"
    >
      <div className={COLUMN_CLASSES[columns]}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex break-inside-avoid cursor-pointer items-start gap-2 text-sm leading-5 text-slate-900"
          >
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0"
              checked={value.includes(option.value)}
              onChange={(event) => toggle(option.value, event.target.checked)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
