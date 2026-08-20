import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-3xl border border-amber-100 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 shadow-sm shadow-amber-900/5 backdrop-blur-sm transition-all duration-200',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge(clsx('p-5 pb-3', className))} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={twMerge(clsx('text-lg font-bold text-neutral-900 dark:text-neutral-100', className))} {...props}>{children}</h3>;
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge(clsx('p-5 pt-0', className))} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge(clsx('p-5 pt-3 border-t border-amber-50 dark:border-neutral-800/50 flex items-center justify-between', className))} {...props}>{children}</div>;
}
