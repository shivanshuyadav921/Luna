import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="w-full py-4 px-6 max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🐱</span>
          <span className="font-extrabold text-2xl tracking-tight text-orange-600">Luna</span>
        </Link>
      </header>
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-8">
        <h1 className="text-4xl font-black">Terms of Service</h1>
        <Card className="p-8 space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
          <p>By using Luna, you agree to respect community safety and celebrate cat companion culture responsibly.</p>
          <p>Harmful content, harassment, hate speech, and spam are strictly prohibited and subject to account termination.</p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
