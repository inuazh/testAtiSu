import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

const BASE_CLASSES =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', invalid = false, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`${BASE_CLASSES} ${invalid ? 'border-red-400' : ''} ${className}`}
      {...rest}
    />
  );
});
