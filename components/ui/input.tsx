import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 rounded-2xl border border-amber-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 text-sm',
              error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
              className
            )
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 rounded-2xl border border-amber-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 text-sm resize-none',
              error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
              className
            )
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
