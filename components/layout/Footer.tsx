import React from 'react';
import Link from 'next/link';
import { Heart, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-amber-200/60 dark:border-neutral-800 bg-amber-50/50 dark:bg-neutral-900/50 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1 */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg">
              🐱
            </div>
            <span className="font-extrabold text-lg text-neutral-900 dark:text-neutral-100">Luna</span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            People meet through their cats, not through their identities. A peaceful, anonymous social experience.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full w-fit">
            <Lock className="w-3 h-3" />
            <span>Privacy First Architecture</span>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mb-3">Explore</h4>
          <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
            <li><Link href="/discover" className="hover:text-orange-500 transition-colors">Discover Cats</Link></li>
            <li><Link href="/about" className="hover:text-orange-500 transition-colors">Product Vision</Link></li>
            <li><Link href="/safety" className="hover:text-orange-500 transition-colors">Safety & Privacy Model</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mb-3">Legal & Safety</h4>
          <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
            <li><Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
            <li><Link href="/guidelines" className="hover:text-orange-500 transition-colors">Community Guidelines</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Peaceful Socializing</h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Designed for genuine connection without toxicity or pressure. Share daily joy with cat lovers worldwide.
          </p>
          <p className="text-[11px] text-neutral-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for cats everywhere.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-amber-200/40 dark:border-neutral-800 text-center text-[11px] text-neutral-400">
        © {new Date().getFullYear()} Luna Social Platform. All human identities strictly protected.
      </div>
    </footer>
  );
}
