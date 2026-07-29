import type { ReactNode } from 'react';

type Tone = 'neutral' | 'danger';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'border-slate-200 bg-white text-slate-600',
  danger: 'border-red-200 bg-red-50 text-red-700',
};

interface StateMessageProps {
  tone?: Tone;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export function StateMessage({ tone = 'neutral', title, description, action }: StateMessageProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : undefined}
      className={`flex flex-col items-center gap-2 rounded-lg border px-6 py-10 text-center ${TONE_CLASSES[tone]}`}
    >
      <p className="text-sm font-semibold">{title}</p>
      {description !== undefined && <p className="max-w-md text-sm">{description}</p>}
      {action}
    </div>
  );
}
