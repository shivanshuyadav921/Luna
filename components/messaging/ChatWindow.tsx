'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message, Cat, IdentityRevealPermission, IdentityRevealRequest } from '@/types';
import { sendMessageAction } from '@/actions/messages';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IdentityRevealModal } from '@/components/identity/IdentityRevealModal';
import { Send, Lock, Sparkles, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface ChatWindowProps {
  conversationId: string;
  activeCat: Cat;
  otherCat: Cat;
  initialMessages: Message[];
  isRevealed: boolean;
  pendingRequest: IdentityRevealRequest | null;
  permissions: IdentityRevealPermission[];
  currentUserId: string;
}

export function ChatWindow({
  conversationId,
  activeCat,
  otherCat,
  initialMessages,
  isRevealed,
  pendingRequest,
  permissions,
  currentUserId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [revealModalOpen, setRevealModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to Supabase Realtime for message updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Avoid duplication if already present locally
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, { ...newMsg, sender_cat: newMsg.sender_cat_id === activeCat.id ? activeCat : otherCat }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, activeCat, otherCat]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('conversationId', conversationId);
    formData.append('senderCatId', activeCat.id);
    formData.append('content', content);

    // Optimistic update
    const tempId = `temp_${Date.now()}`;
    const newMsgObj: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_cat_id: activeCat.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
      sender_cat: activeCat,
    };

    setMessages((prev) => [...prev, newMsgObj]);
    setContent('');

    const res = await sendMessageAction(formData);
    if (res.error) {
      console.error('Failed to send message:', res.error);
    }
    setLoading(false);
  }

  // Find partner's revealed permissions if mutually revealed
  const partnerPermission = permissions.find((p) => p.user_id !== currentUserId);

  return (
    <div className="flex flex-col h-[80vh] max-h-[700px] border border-amber-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900 shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 bg-amber-50 dark:bg-neutral-850 border-b border-amber-200/80 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={otherCat.avatar_url} alt={otherCat.name} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/cats/${otherCat.id}`} className="font-extrabold text-base text-neutral-900 dark:text-neutral-100 hover:underline">
                {otherCat.name} 🐱
              </Link>
              {otherCat.country_code && <span className="text-xs text-neutral-500">[{otherCat.country_code}]</span>}
            </div>
            <p className="text-xs text-neutral-500">{otherCat.mood || '😸 Connected Cat'}</p>
          </div>
        </div>

        {/* Identity Reveal Trigger */}
        <div>
          {isRevealed ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Mutually Revealed</span>
            </div>
          ) : pendingRequest ? (
            <Button
              size="sm"
              onClick={() => setRevealModalOpen(true)}
              className="gap-1.5 rounded-full text-xs bg-amber-500 hover:bg-amber-600 text-white animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Respond to Reveal Request</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRevealModalOpen(true)}
              className="gap-1.5 rounded-full text-xs hover:border-orange-500 hover:text-orange-600"
            >
              <Lock className="w-3.5 h-3.5 text-orange-500" />
              <span>Request Identity Reveal</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mutually Revealed Banner Card if revealed */}
      {isRevealed && partnerPermission && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-extrabold text-emerald-900 dark:text-emerald-200">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>{otherCat.name}&apos;s Human Revealed Information:</span>
          </div>
          <div className="flex flex-wrap gap-3 text-neutral-700 dark:text-neutral-300">
            {partnerPermission.first_name && <span><strong>Name:</strong> {partnerPermission.first_name}</span>}
            {partnerPermission.country && <span><strong>Country:</strong> {partnerPermission.country}</span>}
            {partnerPermission.social_handle && <span><strong>Social:</strong> {partnerPermission.social_handle}</span>}
            {partnerPermission.bio_note && <span><strong>Note:</strong> {partnerPermission.bio_note}</span>}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-amber-50/20 to-transparent">
        <div className="text-center py-2">
          <span className="text-[11px] font-semibold text-neutral-400 bg-amber-100/60 dark:bg-neutral-800 px-3 py-1 rounded-full">
            🔒 Anonymous Chat with {otherCat.name}
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12 text-xs text-neutral-400 italic">
            No messages yet. Say hi as {activeCat.name}! 🐾
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_cat_id === activeCat.id;

            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <Avatar
                  src={isMe ? activeCat.avatar_url : otherCat.avatar_url}
                  alt={isMe ? activeCat.name : otherCat.name}
                  size="sm"
                />

                <div className="space-y-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-orange-500 text-white rounded-tr-xs shadow-xs'
                        : 'bg-amber-100/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                  <div className={`text-[10px] text-neutral-400 ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-amber-50/80 dark:bg-neutral-850 border-t border-amber-200/80 dark:border-neutral-800 flex items-center gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message ${otherCat.name} as ${activeCat.name}...`}
          className="flex-1 py-2 text-xs sm:text-sm"
        />
        <Button type="submit" isLoading={loading} className="rounded-full px-4">
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Identity Reveal Modal Dialog */}
      <IdentityRevealModal
        conversationId={conversationId}
        requesterCatId={activeCat.id}
        receiverCatId={otherCat.id}
        pendingRequest={pendingRequest}
        isOpen={revealModalOpen}
        onClose={() => setRevealModalOpen(false)}
      />
    </div>
  );
}
