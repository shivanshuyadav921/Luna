import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserCats } from '@/actions/cats';
import { getConversationMessages } from '@/actions/messages';
import { getRevealStatusAndPermissions } from '@/actions/identity';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ChatWindow } from '@/components/messaging/ChatWindow';

export default async function ConversationRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const cats = await getUserCats();
  const activeCat = cats[0];
  if (!activeCat) redirect('/onboarding');

  // Fetch conversation with connection and cats
  const { data: conv } = await supabase
    .from('conversations')
    .select(`
      *,
      connection:connections!conversations_connection_id_fkey(
        *,
        cat_a:cats!connections_cat_a_id_fkey(*),
        cat_b:cats!connections_cat_b_id_fkey(*)
      )
    `)
    .eq('id', id)
    .single();

  if (!conv || !conv.connection) {
    notFound();
  }

  const conn = conv.connection;
  const isParticipant = conn.cat_a_id === activeCat.id || conn.cat_b_id === activeCat.id;

  if (!isParticipant) {
    return (
      <div className="p-8 text-center text-red-500 text-sm font-bold">
        Unauthorized: You are not a participant in this conversation.
      </div>
    );
  }

  const otherCat = conn.cat_a_id === activeCat.id ? conn.cat_b : conn.cat_a;
  const messages = await getConversationMessages(id);
  const revealInfo = await getRevealStatusAndPermissions(id);

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 dark:bg-neutral-950 pb-20">
      <Navbar user={user} cats={cats} selectedCatId={activeCat.id} />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-4 w-full">
        <ChatWindow
          conversationId={id}
          activeCat={activeCat}
          otherCat={otherCat}
          initialMessages={messages}
          isRevealed={revealInfo.isRevealed}
          pendingRequest={revealInfo.pendingRequest}
          permissions={revealInfo.permissions}
          currentUserId={revealInfo.currentUserId || user.id}
        />
      </main>

      <MobileNav />
    </div>
  );
}
