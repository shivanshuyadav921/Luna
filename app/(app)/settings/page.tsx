import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getUserCats } from '@/actions/cats';
import { deleteAccountAction } from '@/actions/safety';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Settings, ShieldCheck, Lock, Trash2, Eye, Cat as CatIcon } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function handleDeleteAccount() {
  'use server';
  await deleteAccountAction();
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cats = await getUserCats();
  const activeCat = cats[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 dark:bg-neutral-950 pb-20">
      <Navbar user={user} cats={cats} selectedCatId={activeCat?.id} />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-6 w-full space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-xs font-bold">
            <Settings className="w-4 h-4 text-orange-500" />
            <span>Account & Privacy Controls</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-100">
            Settings & Security
          </h1>
        </div>

        {/* Managed Cat Profiles Section */}
        <Card className="p-5 space-y-4 border-amber-200/80">
          <div className="flex items-center justify-between border-b border-amber-100 dark:border-neutral-800 pb-3">
            <h2 className="font-extrabold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <CatIcon className="w-4 h-4 text-orange-500" />
              <span>Managed Cat Profiles ({cats.length})</span>
            </h2>
            <Link href="/cats/new">
              <Button size="sm" variant="outline" className="rounded-full text-xs">
                + Add Another Cat
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {cats.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 dark:bg-neutral-800/60">
                <div className="flex items-center gap-3">
                  <Avatar src={c.avatar_url} alt={c.name} size="md" />
                  <div>
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{c.name}</span>
                    <p className="text-xs text-neutral-500">{c.breed || 'Cat Companion'} • {c.streak_count}d streak</p>
                  </div>
                </div>
                <Link href={`/cats/${c.id}`}>
                  <Button size="sm" variant="ghost" className="text-xs">View Profile →</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy & Safety Overview */}
        <Card className="p-5 space-y-4 border-amber-200/80">
          <h2 className="font-extrabold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Privacy Architecture</span>
          </h2>
          <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="p-3 rounded-xl bg-emerald-50 dark:emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Human Email & ID strictly protected behind PostgreSQL Row Level Security.</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-neutral-800 border border-amber-200 dark:border-neutral-700 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Identity reveal is limited to 2-way mutual consent records.</span>
            </div>
          </div>
        </Card>

        {/* Account Deletion */}
        <Card className="p-5 space-y-4 border-red-200 dark:border-red-950 bg-red-50/20 dark:bg-red-950/10">
          <div className="space-y-1">
            <h2 className="font-extrabold text-base text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Delete Account & Erase All Data</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Permanently deletes your account, cats, posts, photos, messages, and connections. This action cannot be undone.
            </p>
          </div>

          <form action={handleDeleteAccount}>
            <Button type="submit" variant="destructive" size="sm" className="rounded-2xl font-bold">
              Permanently Delete My Account
            </Button>
          </form>
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
