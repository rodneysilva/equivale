import { createContext, useContext, createSignal } from 'solid-js';
import type { ParentComponent } from 'solid-js';
import ToastContainer from '../components/ui/Toast';

export interface ToastItem {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: () => ToastItem[];
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  remove: (id: number) => void;
}

const ToastContext = createContext<ToastState>();

export const ToastProvider: ParentComponent = (props) => {
  const [toasts, setToasts] = createSignal<ToastItem[]>([]);
  let nextId = 0;

  const remove = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const push = (type: ToastItem['type'], message: string, duration = 4000) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
  };

  const state: ToastState = {
    toasts,
    success: (message, duration?) => push('success', message, duration),
    error: (message, duration?) => push('error', message, duration),
    info: (message, duration?) => push('info', message, duration),
    warning: (message, duration?) => push('warning', message, duration),
    remove,
  };

  return (
    <ToastContext.Provider value={state}>
      <ToastContainer />
      {props.children}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastState {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
