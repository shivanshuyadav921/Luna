'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home, MessageSquareHeart, Bell, Settings, Cat as CatIcon, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Cat } from '@/types';
import { signOutAction } from '@/actions/auth';

interface NavbarProps {
  user?: { id: string; email?: string } | null;
  cats?: Cat[];
  selectedCatId?: string | null;
  onSelectCat?: (catId: string) => void;
  onSignOut?: () => void;
}

export function Navbar({ user, cats = [], selectedCatId, onSelectCat, onSignOut }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    if (onSignOut) {
      onSignOut();
      return;
    }
    await signOutAction();
  }

  const selectedCat = cats.find((c) => c.id === selectedCatId) || cats[0];

  const navLinks = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/connections', label: 'Connections', icon: CatIcon },
    { href: '/messages', label: 'Messages', icon: MessageSquareHeart },
    { href: '/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-200/60 dark:border-neutral-800/80 bg-amber-50/80 dark:bg-neutral-900/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={user ? '/home' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="text-xl">🐱</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
              Luna
            </span>
            <span className="text-[10px] font-medium tracking-wide text-neutral-500 dark:text-neutral-400 -mt-1">
              Cat Social
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-200/60 dark:bg-neutral-800 text-orange-600 dark:text-orange-400 font-semibold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-amber-100/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Post Button */}
              <Link href="/posts/create" className="hidden sm:block">
                <Button size="sm" className="gap-1.5 rounded-full px-4">
                  <PlusCircle className="w-4 h-4" />
                  <span>Daily Post</span>
                </Button>
              </Link>

              {/* Active Cat Selector Pill */}
              {cats.length > 0 && selectedCat && (
                <div className="relative group">
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-amber-200 dark:border-neutral-700 shadow-xs hover:border-orange-400 transition-colors"
                  >
                    <Avatar src={selectedCat.avatar_url} alt={selectedCat.name} size="sm" />
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 max-w-[80px] truncate">
                      {selectedCat.name}
                    </span>
                  </button>

                  {/* Dropdown menu if multiple cats */}
                  {cats.length > 1 && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-amber-100 dark:border-neutral-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                      <div className="px-3 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Switch Cat Profile
                      </div>
                      {cats.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => onSelectCat?.(cat.id)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-amber-50 dark:hover:bg-neutral-700/50 ${
                            cat.id === selectedCat.id ? 'bg-amber-100/60 font-bold text-orange-600' : ''
                          }`}
                        >
                          <Avatar src={cat.avatar_url} alt={cat.name} size="sm" />
                          <span>{cat.name}</span>
                        </button>
                      ))}
                      <div className="border-t border-amber-100 dark:border-neutral-700 my-1"></div>
                      <Link
                        href="/cats/new"
                        className="block px-3 py-1.5 text-xs text-orange-600 font-semibold hover:underline"
                      >
                        + Add another cat
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Settings & Sign Out */}
              <Link href="/settings" className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-orange-500 rounded-full hover:bg-amber-100/50 dark:hover:bg-neutral-800">
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 text-neutral-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="rounded-full shadow-md">
                  Join Luna
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 dark:text-neutral-300 hover:bg-amber-100 dark:hover:bg-neutral-800 rounded-2xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-200 dark:border-neutral-800 bg-amber-50 dark:bg-neutral-900 px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-neutral-800 dark:text-neutral-200 hover:bg-amber-100 dark:hover:bg-neutral-800"
              >
                <Icon className="w-5 h-5 text-orange-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-amber-200 dark:border-neutral-800 space-y-2">
            <Link
              href="/posts/create"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full block"
            >
              <Button className="w-full py-3 rounded-2xl font-bold gap-2">
                <PlusCircle className="w-5 h-5" />
                <span>Post Daily Cat Photo</span>
              </Button>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
