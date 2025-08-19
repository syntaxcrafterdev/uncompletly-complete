import * as React from 'react';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
  {
    variants: {
      variant: {
        default: 'border bg-background',
        destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'group border-green-500 bg-green-50 text-green-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title: string;
  description?: string;
  onDismiss?: () => void;
}

export function Toast({
  className,
  variant,
  title,
  description,
  onDismiss,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="grid gap-1">
        <div className="text-sm font-semibold">{title}</div>
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastViewport({
  toasts,
  dismissToast,
  className,
  ...props
}: {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
  }>;
  dismissToast: (id: string) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
        className
      )}
      {...props}
    >
      {toasts.map(({ id, title, description, variant = 'default' }) => (
        <Toast
          key={id}
          variant={variant}
          title={title}
          description={description}
          onDismiss={() => dismissToast(id)}
        />
      ))}
    </div>
  );
}

export { ToastProvider } from './use-toast';
