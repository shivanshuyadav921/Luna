import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-amber-50/40 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Card className="max-w-md w-full p-8 text-center space-y-4 border-amber-200 shadow-xl">
        <div className="text-6xl">😿</div>
        <h1 className="text-3xl font-black">404 - Cat Not Found</h1>
        <p className="text-xs text-neutral-500">
          The page or cat profile you are looking for has wandered off into another sunbeam.
        </p>
        <Link href="/" className="block pt-2">
          <Button className="w-full font-bold rounded-2xl">Return to Luna Home 🐾</Button>
        </Link>
      </Card>
    </div>
  );
}
