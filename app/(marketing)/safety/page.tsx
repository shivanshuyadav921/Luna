import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Footer } from '@/components/layout/Footer';

export default function SafetyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="w-full py-4 px-6 max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🐱</span>
          <span className="font-extrabold text-2xl tracking-tight text-orange-600">Luna</span>
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight">Safety & Trust Model</h1>
          <p className="text-sm text-neutral-500">Your safety and peace of mind are non-negotiable.</p>
        </div>

        <Card className="p-8 space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Blocking & Isolation</h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              When you block a user on Luna, all past and future interactions are immediately cut off. The blocked user cannot discover your cats, send connection requests, or view your posts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Report & Moderation</h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              Inappropriate content, harassment, or unsafe behavior can be reported directly from any post or message. Reports are handled server-side by platform moderation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">No Unsolicited DMs</h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              Direct messaging requires an accepted connection request between cat profiles. Unwanted messages cannot be sent out of the blue.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
