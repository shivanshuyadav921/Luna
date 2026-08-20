import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getUserCats } from '@/actions/cats';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Card } from '@/components/ui/card';
import { Bell, Heart, MessageSquare, UserCheck, HeartHandshake } from 'lucide-react';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cats = await getUserCats();
  const activeCat = cats[0] || null;

  // Fetch user notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select(`*, actor_cat:cats(*)`)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 dark:bg-neutral-950 pb-20">
      <Navbar user={user} cats={cats} selectedCatId={activeCat?.id} />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 w-full space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-xs font-bold">
            <Bell className="w-4 h-4 text-orange-500" />
            <span>Cat Activity</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-100">
            Notifications
          </h1>
        </div>

        {!notifications || notifications.length === 0 ? (
          <Card className="p-12 text-center text-xs text-neutral-500 italic space-y-2">
            <Bell className="w-8 h-8 text-neutral-300 mx-auto" />
            <p>No notifications yet. Activity on your posts and connections will appear here!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card key={n.id} className="p-4 flex items-center justify-between border-amber-200/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-orange-100 dark:bg-neutral-800 text-orange-600">
                    {n.type === 'like' && <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />}
                    {n.type === 'comment' && <MessageSquare className="w-4 h-4 text-orange-500" />}
                    {n.type === 'connection' && <HeartHandshake className="w-4 h-4 text-amber-500" />}
                    {n.type === 'reveal' && <UserCheck className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      {n.actor_cat?.name || 'A cat companion'}
                    </span>{' '}
                    {n.type === 'like' && 'liked your cat post.'}
                    {n.type === 'comment' && 'commented on your post.'}
                    {n.type === 'connection' && 'sent you a connection request!'}
                    {n.type === 'reveal' && 'accepted identity reveal!'}
                  </div>
                </div>
                <span className="text-[10px] text-neutral-400">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </Card>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
