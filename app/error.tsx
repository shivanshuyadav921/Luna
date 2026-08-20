'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ErrorPage({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-amber-50/40 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Card className="max-w-md w-full p-8 text-center space-y-4 border-red-200 shadow-xl">
        <div className="text-5xl">🙀</div>
        <h1 className="text-2xl font-black">Something went wrong</h1>
        <p className="text-xs text-neutral-500">
          An unexpected error occurred. Don&apos;t worry, your cat identity is safe!
        </p>
        <Button onClick={reset} className="w-full font-bold rounded-2xl">
          Try Again 🐾
        </Button>
      </Card>
    </div>
  );
}
