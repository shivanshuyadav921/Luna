import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackEmoji?: string;
}

export function Avatar({ src, alt, size = 'md', className, fallbackEmoji = '🐱' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-2xl',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'relative rounded-full overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center border-2 border-white dark:border-neutral-800 shadow-sm flex-shrink-0',
          sizes[size],
          className
        )
      )}
    >
      {src ? (
        // eslint-disable-next-next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span role="img" aria-label={alt}>
          {fallbackEmoji}
        </span>
      )}
    </div>
  );
}
