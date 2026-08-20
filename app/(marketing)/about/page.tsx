import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="w-full py-4 px-6 max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🐱</span>
          <span className="font-extrabold text-2xl tracking-tight text-orange-600">Luna</span>
        </Link>
        <Link href="/signup">
          <span className="text-sm font-semibold text-orange-600 hover:underline">Get Started →</span>
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            About Luna 🐾
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Luna was built on a simple premise: <strong>People meet through their cats, not through their identities.</strong>
          </p>
        </div>

        <Card className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Our Core Philosophy</h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Modern social networks often pressure people to broadcast their personal lives, real names, status, and locations. Luna reverses this paradigm by anchoring every interaction around your cat.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li><strong>Peaceful & Warm:</strong> Share daily photos without toxic algorithms or engagement bait.</li>
            <li><strong>Privacy First:</strong> Human identity is hidden by default.</li>
            <li><strong>Controlled Reveal:</strong> Reveal who you are only when trust is earned and both people explicitly consent.</li>
          </ul>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
