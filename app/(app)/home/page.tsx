import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getHomeFeed } from '@/actions/posts';
import { getUserCats } from '@/actions/cats';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PostCard } from '@/components/feed/PostCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { PlusCircle, Sparkles, Flame, Compass } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cats = await getUserCats();
  if (!cats || cats.length === 0) {
    redirect('/onboarding');
  }

  const activeCat = cats[0];
  const posts = await getHomeFeed(20, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/50 via-background to-orange-50/20 dark:from-neutral-950 dark:to-neutral-900 pb-20">
      <Navbar user={user} cats={cats} selectedCatId={activeCat?.id} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Post Creation Banner */}
          {activeCat && (
            <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-neutral-800 dark:to-neutral-850 border-amber-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <Avatar src={activeCat.avatar_url} alt={activeCat.name} size="md" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    What is {activeCat.name} up to today?
                  </h3>
                  <p className="text-xs text-neutral-500">Post a photo to keep your {activeCat.streak_count || 1}-day streak alive!</p>
                </div>
                <Link href="/posts/create">
                  <Button size="sm" className="gap-1.5 rounded-full">
                    <PlusCircle className="w-4 h-4" />
                    <span>Post</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Feed Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-black text-xl text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Daily Cat Feed</span>
              <Sparkles className="w-4 h-4 text-orange-500" />
            </h2>
            <span className="text-xs text-neutral-500">Showing recent cat stories</span>
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <Card className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-neutral-800 flex items-center justify-center text-3xl mx-auto">
                🐱
              </div>
              <h3 className="font-bold text-lg">No cat posts yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Be the first cat companion to post a photo today or explore Discovery!
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link href="/posts/create">
                  <Button size="sm" className="rounded-full">Post Daily Photo</Button>
                </Link>
                <Link href="/discover">
                  <Button variant="outline" size="sm" className="rounded-full">Explore Discover</Button>
                </Link>
              </div>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} activeCat={activeCat} />
            ))
          )}
        </div>

        {/* Sidebar Info Column */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          {/* Managed Cat Widget */}
          {activeCat && (
            <Card className="p-5 space-y-4 border-amber-200/80">
              <div className="flex items-center gap-3">
                <Avatar src={activeCat.avatar_url} alt={activeCat.name} size="lg" />
                <div>
                  <h3 className="font-black text-base text-neutral-900 dark:text-neutral-100">{activeCat.name}</h3>
                  <p className="text-xs text-neutral-500">{activeCat.mood || '😸 Happy'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-100 dark:border-neutral-800">
                <span className="text-neutral-500">Streak:</span>
                <span className="font-bold text-orange-600 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" /> {activeCat.streak_count} Days
                </span>
              </div>
              <Link href={`/cats/${activeCat.id}`} className="block">
                <Button variant="outline" size="sm" className="w-full rounded-2xl text-xs">
                  View Cat Profile
                </Button>
              </Link>
            </Card>
          )}

          {/* Quick Discover Links */}
          <Card className="p-5 space-y-3">
            <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-orange-500" />
              <span>Explore Categories</span>
            </h4>
            <div className="space-y-2 text-xs">
              <Link href="/discover?tab=today" className="flex items-center justify-between p-2 rounded-xl hover:bg-amber-100/60 dark:hover:bg-neutral-800 font-medium">
                <span>Today&apos;s Cats 🌟</span>
                <span className="text-neutral-400">→</span>
              </Link>
              <Link href="/discover?tab=rising" className="flex items-center justify-between p-2 rounded-xl hover:bg-amber-100/60 dark:hover:bg-neutral-800 font-medium">
                <span>Rising Cats 🔥</span>
                <span className="text-neutral-400">→</span>
              </Link>
              <Link href="/discover?tab=random" className="flex items-center justify-between p-2 rounded-xl hover:bg-amber-100/60 dark:hover:bg-neutral-800 font-medium">
                <span>Random Cat 🎲</span>
                <span className="text-neutral-400">→</span>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
