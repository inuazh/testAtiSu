import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string | undefined;
  hint?: ReactNode;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="min-h-4 text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
      {hint !== undefined && <p className="text-xs text-slate-500">{hint}</p>}
      {error !== undefined && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
