import { create } from 'zustand';

export const TOAST_TONE = {
  Success: 'success',
  Error: 'error',
} as const;

export type ToastTone = (typeof TOAST_TONE)[keyof typeof TOAST_TONE];

export interface Toast {
  id: string;
  tone: ToastTone;
  message: string;
}

const AUTO_DISMISS_MS = 5000;

interface ToastState {
  toasts: Toast[];
  push: (tone: ToastTone, message: string) => void;
  dismiss: (id: string) => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  push: (tone, message) => {
    nextId += 1;
    const id = `toast-${nextId}`;

    set((state) => ({ toasts: [...state.toasts, { id, tone, message }] }));

    setTimeout(() => {
      get().dismiss(id);
    }, AUTO_DISMISS_MS);
  },

  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
}));

export function showSuccessToast(message: string): void {
  useToastStore.getState().push(TOAST_TONE.Success, message);
}

export function showErrorToast(message: string): void {
  useToastStore.getState().push(TOAST_TONE.Error, message);
}
