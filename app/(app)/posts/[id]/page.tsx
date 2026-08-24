import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPostById, getPostComments } from '@/actions/posts';
import { getUserCats } from '@/actions/cats';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PostCard } from '@/components/feed/PostCard';
import { CommentSection } from '@/components/feed/CommentSection';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cats = await getUserCats();
  const activeCat = cats[0] || null;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const comments = await getPostComments(id);

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 dark:bg-neutral-950 pb-20">
      <Navbar user={user} cats={cats} selectedCatId={activeCat?.id} />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 w-full space-y-6">
        <PostCard post={post} activeCat={activeCat} />

        <Card className="p-5 border-amber-200/80 dark:border-neutral-800">
          <CommentSection postId={post.id} comments={comments} activeCat={activeCat} />
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
