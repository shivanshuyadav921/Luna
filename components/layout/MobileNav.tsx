'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, MessageSquareHeart, Cat as CatIcon } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const items = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/posts/create', label: 'Post', icon: PlusCircle, isPrimary: true },
    { href: '/connections', label: 'Cats', icon: CatIcon },
    { href: '/messages', label: 'Chat', icon: MessageSquareHeart },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-900/90 border-t border-amber-200/60 dark:border-neutral-800 backdrop-blur-md px-2 py-2">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 mt-1">
                  Post
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-12 py-1 transition-colors ${
                isActive ? 'text-orange-500 dark:text-orange-400 font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
