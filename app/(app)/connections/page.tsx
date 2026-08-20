import React from 'react';
import { ConnectionRequest, Connection } from '@/types';
import { createClient } from '@/lib/supabase/server';
import { getUserCats } from '@/actions/cats';
import { getConnectionRequests, getConnectionsList, acceptConnectionRequestAction, declineConnectionRequestAction } from '@/actions/connections';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Cat as CatIcon, Check, X, MessageSquareHeart, HeartHandshake } from 'lucide-react';
import Link from 'next/link';

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cats = await getUserCats();
  const activeCat = cats[0] || null;

  let pendingRequests: ConnectionRequest[] = [];
  let connections: Connection[] = [];

  if (activeCat) {
    pendingRequests = await getConnectionRequests(activeCat.id);
    connections = await getConnectionsList(activeCat.id);
  }

  // Fetch conversation IDs keyed by connection_id so the Chat button links directly
  let conversationMap: Record<string, string> = {};
  if (connections.length > 0) {
    const connectionIds = connections.map((c) => c.id);
    const { data: convs } = await supabase
      .from('conversations')
      .select('id, connection_id')
      .in('connection_id', connectionIds);
    if (convs) {
      conversationMap = Object.fromEntries(convs.map((c) => [c.connection_id, c.id]));
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 dark:bg-neutral-950 pb-20">
      <Navbar user={user} cats={cats} selectedCatId={activeCat?.id} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-xs font-bold">
            <HeartHandshake className="w-4 h-4 text-orange-500" />
            <span>Anonymous Connections</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-100">
            Cat Friends & Requests
          </h1>
          <p className="text-xs text-neutral-500">
            Connect anonymously through your cats. Accept requests to start private cat-to-cat messaging.
          </p>
        </div>

        {/* Section 1: Pending Connection Requests */}
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Pending Requests ({pendingRequests.length})</span>
          </h2>

          {pendingRequests.length === 0 ? (
            <Card className="p-6 text-center text-xs text-neutral-500 italic">
              No pending connection requests for {activeCat?.name || 'your cat'}.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => {
                const senderCat = req.sender_cat;
                if (!senderCat) return null;

                return (
                  <Card key={req.id} className="p-4 flex items-center justify-between border-amber-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Avatar src={senderCat.avatar_url} alt={senderCat.name} size="md" />
                      <div>
                        <Link href={`/cats/${senderCat.id}`} className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 hover:underline">
                          {senderCat.name} 🐱
                        </Link>
                        <p className="text-xs text-neutral-500">{senderCat.breed || 'Cat Companion'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <form action={async () => {
                        'use server';
                        await acceptConnectionRequestAction(req.id);
                      }}>
                        <Button size="sm" type="submit" className="rounded-full bg-emerald-500 hover:bg-emerald-600 p-2">
                          <Check className="w-4 h-4 text-white" />
                        </Button>
                      </form>

                      <form action={async () => {
                        'use server';
                        await declineConnectionRequestAction(req.id);
                      }}>
                        <Button size="sm" type="submit" variant="outline" className="rounded-full p-2">
                          <X className="w-4 h-4 text-neutral-500" />
                        </Button>
                      </form>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Connected Cats List */}
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Connected Cats ({connections.length})</span>
          </h2>

          {connections.length === 0 ? (
            <Card className="p-8 text-center space-y-3 text-neutral-500 text-xs">
              <CatIcon className="w-10 h-10 text-amber-400 mx-auto" />
              <p>You haven&apos;t connected with any cats yet.</p>
              <Link href="/discover" className="inline-block">
                <Button size="sm" className="rounded-full">Discover Cats</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((conn) => {
                const otherCat = conn.cat_a_id === activeCat?.id ? conn.cat_b : conn.cat_a;
                if (!otherCat) return null;

                // Link directly to the specific conversation, not just the messages list
                const conversationId = conversationMap[conn.id];
                const chatHref = conversationId ? `/messages/${conversationId}` : '/messages';

                return (
                  <Card key={conn.id} className="p-4 flex items-center justify-between border-amber-200/80 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <Avatar src={otherCat.avatar_url} alt={otherCat.name} size="lg" />
                      <div>
                        <Link href={`/cats/${otherCat.id}`} className="font-extrabold text-base text-neutral-900 dark:text-neutral-100 hover:text-orange-600">
                          {otherCat.name} 🐱
                        </Link>
                        <p className="text-xs text-neutral-500">{otherCat.mood || '😸 Connected Cat'}</p>
                      </div>
                    </div>

                    <Link href={chatHref}>
                      <Button size="sm" className="gap-1.5 rounded-full text-xs">
                        <MessageSquareHeart className="w-4 h-4" />
                        <span>Chat</span>
                      </Button>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
