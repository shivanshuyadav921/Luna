import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-neutral-500">Last updated: August 2026</p>
        </div>

        <Card className="p-8 space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">1. Data Minimization</h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              We collect only the minimum authentication details required to secure your account. Your email and account IDs are strictly isolated behind database Row Level Security policies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">2. Image EXIF & Location Protection</h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              All images uploaded to Luna undergo client-side and server-side EXIF sanitization. GPS coordinates, device identifiers, and timestamp headers are stripped prior to storage.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">3. Mutual Identity Reveal</h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              Your real identity will never be disclosed to another user unless both participants complete the 2-way consent protocol in a conversation.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
