import { TOAST_TONE, type ToastTone, useToastStore } from './toastStore';

const TONE_CLASSES: Record<ToastTone, string> = {
  [TOAST_TONE.Success]: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  [TOAST_TONE.Error]: 'border-red-200 bg-red-50 text-red-900',
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((toast) => (
        <output
          key={toast.id}
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${TONE_CLASSES[toast.tone]}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="text-xs font-medium opacity-70 hover:opacity-100"
            aria-label="Закрыть уведомление"
          >
            ✕
          </button>
        </output>
      ))}
    </div>
  );
}
