import * as React from 'react';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';

type ToastType = 'default' | 'destructive' | 'success';

type ToastData = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
};

type ToastContextType = {
  toasts: ToastData[];
  toast: (data: Omit<ToastData, 'id'>) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const toast = React.useCallback(
    ({ title, description, variant = 'default', duration = 5000 }: Omit<ToastData, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((currentToasts) => [
        ...currentToasts,
        { id, title, description, variant },
      ]);

      if (duration) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    []
  );

  const dismissToast = React.useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismissToast }}>
      {children}
      <ToastViewport toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
