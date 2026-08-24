import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCatById, getUserCats } from '@/actions/cats';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PostCard } from '@/components/feed/PostCard';
import { Flame, ShieldCheck, Cat as CatIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CatProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userCats = await getUserCats();
  const activeCat = userCats[0] || null;
  const cat = await getCatById(id);

  if (!cat) {
    notFound();
  }

  // Fetch posts published by this cat
  const { data: catPosts } = await supabase
    .from('posts')
    .select(`*, cat:cats(*)`)
    .eq('cat_id', cat.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 dark:bg-neutral-950 pb-20">
      <Navbar user={user} cats={userCats} selectedCatId={activeCat?.id} />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Profile Card Header */}
        <Card className="p-6 border-amber-200 dark:border-neutral-800 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left">
            <Avatar src={cat.avatar_url} alt={cat.name} size="xl" className="border-4 border-orange-400 shadow-md" />
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-100">{cat.name} 🐱</h1>
                {cat.country_code && <Badge variant="neutral">[{cat.country_code}]</Badge>}
                <Badge variant="amber">{cat.mood || '😸 Happy'}</Badge>
              </div>

              <p className="text-xs text-neutral-500">
                {cat.age_years} {cat.age_years === 1 ? 'year' : 'years'} old {cat.breed ? `• ${cat.breed}` : ''} {cat.gender ? `• ${cat.gender}` : ''}
              </p>

              {cat.bio && (
                <p className="text-sm text-neutral-700 dark:text-neutral-300 italic pt-1 max-w-lg">
                  &quot;{cat.bio}&quot;
                </p>
              )}
            </div>

            <div className="flex sm:flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-950 px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span>{cat.streak_count}d Streak</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-amber-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Owner Human Identity Protected</span>
            </span>
            <span>{catPosts?.length || 0} Posts</span>
          </div>
        </Card>

        {/* Cat Posts Grid/List */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <CatIcon className="w-5 h-5 text-orange-500" />
            <span>{cat.name}&apos;s Daily Stories</span>
          </h3>

          {!catPosts || catPosts.length === 0 ? (
            <Card className="p-8 text-center text-xs text-neutral-500 italic">
              {cat.name} hasn&apos;t posted any photos yet.
            </Card>
          ) : (
            catPosts.map((post) => (
              <PostCard key={post.id} post={{ ...post, cat }} activeCat={activeCat} />
            ))
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
