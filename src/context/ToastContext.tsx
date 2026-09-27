import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { playSound } from '../utils/audio';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastOptions {
  title?: string;
  duration?: number;
  sound?: boolean;
}

let toastIdCounter = 0;
let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const toast = {
  add: (message: string, type: ToastType = 'info', options?: ToastOptions) => {
    const id = `toast_${Date.now()}_${++toastIdCounter}`;
    const duration = options?.duration ?? 4000;
    const newToast: ToastItem = {
      id,
      type,
      title: options?.title,
      message,
      duration,
    };
    toasts = [...toasts, newToast];
    emitChange();

    if (options?.sound !== false) {
      if (type === 'error') {
        playSound('error');
      } else if (type === 'success') {
        playSound('select');
      } else {
        playSound('nav');
      }
    }

    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, duration);
    }
    return id;
  },
  success: (message: string, options?: ToastOptions) =>
    toast.add(message, 'success', options),
  error: (message: string, options?: ToastOptions) =>
    toast.add(message, 'error', options),
  info: (message: string, options?: ToastOptions) =>
    toast.add(message, 'info', options),
  warning: (message: string, options?: ToastOptions) =>
    toast.add(message, 'warning', options),
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  },
  clear: () => {
    toasts = [];
    emitChange();
  },
};

export function useToast() {
  const currentToasts = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    () => toasts,
    () => toasts
  );

  return {
    toasts: currentToasts,
    toast,
    showToast: toast.add,
    success: toast.success,
    error: toast.error,
    info: toast.info,
    warning: toast.warning,
    dismiss: toast.dismiss,
    clear: toast.clear,
  };
}

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-5 right-5 sm:right-6 max-w-sm sm:max-w-md w-[calc(100%-2.5rem)] z-[200] flex flex-col gap-2.5 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        let borderClass = 'border-l-sky-500';
        let IconComponent = Info;
        let iconColor = 'text-sky-400';

        if (t.type === 'success') {
          borderClass = 'border-l-emerald-500';
          IconComponent = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (t.type === 'error') {
          borderClass = 'border-l-rose-500';
          IconComponent = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (t.type === 'warning') {
          borderClass = 'border-l-amber-500';
          IconComponent = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border border-panel-border border-l-4 ${borderClass} bg-panel-solid/95 backdrop-blur-xl shadow-2xl text-text-main animate-in slide-in-from-top-2 fade-in duration-200 transition-all`}
          >
            <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              {t.title && (
                <h5 className="font-semibold text-sm text-text-main mb-0.5 leading-tight">
                  {t.title}
                </h5>
              )}
              <p className="text-xs sm:text-sm text-text-main/90 font-medium leading-relaxed break-words">
                {t.message}
              </p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-text-dim hover:text-text-main p-1 -mr-1 -mt-1 rounded-lg hover:bg-panel-hover transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastState = useToast();

  return (
    <ToastContext.Provider value={toastState}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};
