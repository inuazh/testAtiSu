import type { SelectOption } from './Select';

interface CheckboxGroupProps {
  id: string;
  ariaLabel: string;
  options: readonly SelectOption[];
  value: readonly string[];
  onChange: (next: string[]) => void;
}

export function CheckboxGroup({ id, ariaLabel, options, value, onChange }: CheckboxGroupProps) {
  const toggle = (optionValue: string, checked: boolean) => {
    const next = checked ? [...value, optionValue] : value.filter((item) => item !== optionValue);

    onChange(options.filter((option) => next.includes(option.value)).map((option) => option.value));
  };

  return (
    <fieldset
      id={id}
      aria-label={ariaLabel}
      className="min-w-0 rounded-md border border-slate-300 bg-white focus-within:border-slate-500"
    >
      <div className="h-32 overflow-y-auto overscroll-contain px-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex h-8 cursor-pointer items-center gap-2 text-sm text-slate-900"
          >
            <input
              type="checkbox"
              className="size-4 shrink-0"
              checked={value.includes(option.value)}
              onChange={(event) => toggle(option.value, event.target.checked)}
            />
            <span className="truncate">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
