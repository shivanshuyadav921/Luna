import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getDiscoverPosts } from '@/actions/posts';
import { getUserCats } from '@/actions/cats';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PostCard } from '@/components/feed/PostCard';
import { Card } from '@/components/ui/card';
import { Compass, Flame, Shuffle, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = 'today' } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cats = await getUserCats();
  const activeCat = cats[0] || null;
  const posts = await getDiscoverPosts(tab);

  // Daily Featured Cat
  const featuredPost = posts[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/50 via-background to-orange-50/20 dark:from-neutral-950 dark:to-neutral-900 pb-20">
      <Navbar user={user} cats={cats} selectedCatId={activeCat?.id} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-6 w-full space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-xs font-bold">
            <Compass className="w-4 h-4 text-orange-500" />
            <span>Discover Feline Stories</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            Cat Discovery Hub
          </h1>
          <p className="text-xs text-neutral-500">Explore public cats worldwide without identity exposure</p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-amber-200/60 dark:border-neutral-800">
          <Link
            href="/discover?tab=today"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              tab === 'today' ? 'bg-orange-500 text-white shadow-md' : 'bg-amber-100/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today&apos;s Cats</span>
          </Link>

          <Link
            href="/discover?tab=rising"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              tab === 'rising' ? 'bg-orange-500 text-white shadow-md' : 'bg-amber-100/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Rising Cats</span>
          </Link>

          <Link
            href="/discover?tab=random"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              tab === 'random' ? 'bg-orange-500 text-white shadow-md' : 'bg-amber-100/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Cat</span>
          </Link>
        </div>

        {/* Featured Cat Banner */}
        {featuredPost && featuredPost.cat && (
          <Card className="p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl rounded-3xl border-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span>Featured Cat of the Day</span>
              </div>
              <span className="text-xs opacity-80">🇮🇳 Country-level view</span>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
              {/* eslint-disable-next-next/no-img-element */}
              <img
                src={featuredPost.image_url}
                alt={featuredPost.cat.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-lg border-2 border-white/40"
              />
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-2xl font-black">{featuredPost.cat.name} 🐱</h3>
                <p className="text-xs opacity-90">{featuredPost.cat.age_years} years old • {featuredPost.cat.breed || 'Cat Companion'}</p>
                <p className="text-xs italic opacity-95 pt-1 max-w-md">&quot;{featuredPost.caption || featuredPost.cat.bio || 'Living the best cat life.'}&quot;</p>
              </div>
            </div>
          </Card>
        )}

        {/* Discovery Feed Grid */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="p-12 text-center text-neutral-500 text-xs">
              No discovery cats found in this category yet.
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} activeCat={activeCat} />
            ))
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
