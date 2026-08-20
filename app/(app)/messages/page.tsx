import React from 'react';
import { Conversation } from '@/types';
import { createClient } from '@/lib/supabase/server';
import { getUserCats } from '@/actions/cats';
import { getConversationsList } from '@/actions/messages';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { MessageSquareHeart, Lock } from 'lucide-react';
import Link from 'next/link';

export default async function MessagesInboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cats = await getUserCats();
  const activeCat = cats[0] || null;

  let conversations: Conversation[] = [];
  if (activeCat) {
    conversations = await getConversationsList(activeCat.id);
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 dark:bg-neutral-950 pb-20">
      <Navbar user={user} cats={cats} selectedCatId={activeCat?.id} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-xs font-bold">
            <MessageSquareHeart className="w-4 h-4 text-orange-500" />
            <span>Anonymous Conversations</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-100">
            Messages Inbox
          </h1>
          <p className="text-xs text-neutral-500">Private cat-to-cat conversations for {activeCat?.name || 'your cat'}</p>
        </div>

        {conversations.length === 0 ? (
          <Card className="p-12 text-center space-y-3 text-neutral-500 text-xs">
            <Lock className="w-10 h-10 text-amber-400 mx-auto" />
            <p>No active conversations yet.</p>
            <p className="text-[11px] text-neutral-400">Connect with other cats to unlock anonymous messaging!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const otherCat = conv.other_cat;
              if (!otherCat) return null;

              return (
                <Link key={conv.id} href={`/messages/${conv.id}`} className="block">
                  <Card className="p-4 flex items-center justify-between border-amber-200/80 hover:shadow-md hover:border-orange-400 transition-all">
                    <div className="flex items-center gap-3">
                      <Avatar src={otherCat.avatar_url} alt={otherCat.name} size="lg" />
                      <div>
                        <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                          {otherCat.name} 🐱
                        </h3>
                        <p className="text-xs text-neutral-500 truncate max-w-xs sm:max-w-md">
                          {conv.latest_message?.content || 'Start conversation...'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-neutral-400">
                      {new Date(conv.last_message_at).toLocaleDateString()}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
