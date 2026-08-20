'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Vercel / browser console so errors can be diagnosed without
    // exposing them to users. error.digest is a stable server-side hash
    // visible in Vercel Runtime Logs even when the full message is redacted.
    console.error('[Luna] Unhandled application error:', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-amber-50/40 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Card className="max-w-md w-full p-8 text-center space-y-4 border-red-200 shadow-xl">
        <div className="text-5xl">🙀</div>
        <h1 className="text-2xl font-black">Something went wrong</h1>
        <p className="text-xs text-neutral-500">
          An unexpected error occurred. Don&apos;t worry, your cat identity is safe!
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={reset} className="w-full font-bold rounded-2xl">
          Try Again 🐾
        </Button>
      </Card>
    </div>
  );
}
