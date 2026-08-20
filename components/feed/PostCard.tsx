'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageSquare, Flame, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Post, Cat } from '@/types';
import { toggleLikePostAction } from '@/actions/posts';
import { sendConnectionRequestAction } from '@/actions/connections';

interface PostCardProps {
  post: Post;
  activeCat?: Cat | null;
  onConnectSuccess?: () => void;
}

export function PostCard({ post, activeCat, onConnectSuccess }: PostCardProps) {
  const [hasLiked, setHasLiked] = useState(post.user_has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [connecting, setConnecting] = useState(false);
  const [connectMessage, setConnectMessage] = useState<string | null>(null);

  const cat = post.cat;
  const isOwnCat = activeCat && cat && activeCat.id === cat.id;

  async function handleLike() {
    if (!activeCat) return;
    const newLiked = !hasLiked;
    setHasLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    await toggleLikePostAction(post.id, activeCat.id);
  }

  async function handleConnect() {
    if (!activeCat || !cat || isOwnCat) return;
    setConnecting(true);
    setConnectMessage(null);

    const res = await sendConnectionRequestAction(activeCat.id, cat.id);
    if (res.error) {
      setConnectMessage(res.error);
    } else {
      setConnectMessage('Connection request sent! 🐾');
      onConnectSuccess?.();
    }
    setConnecting(false);
  }

  if (!cat) return null;

  return (
    <Card className="overflow-hidden border-amber-200/80 dark:border-neutral-800 shadow-md hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-amber-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-3">
          <Link href={`/cats/${cat.id}`}>
            <Avatar src={cat.avatar_url} alt={cat.name} size="md" className="hover:scale-105 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/cats/${cat.id}`} className="font-extrabold text-base text-neutral-900 dark:text-neutral-100 hover:text-orange-600 transition-colors">
                {cat.name}
              </Link>
              {cat.country_code && <span className="text-xs font-medium uppercase text-neutral-500">[{cat.country_code}]</span>}
            </div>
            <p className="text-xs text-neutral-500">
              {cat.age_years} {cat.age_years === 1 ? 'year' : 'years'} old {cat.breed ? `• ${cat.breed}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cat.streak_count > 0 && (
            <Badge variant="amber" className="gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{cat.streak_count}d streak</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Post Photo */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image_url}
          alt={post.caption || 'Cat photo'}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {post.mood && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
            {post.mood}
          </div>
        )}
      </div>

      {/* Caption & Tags */}
      <div className="p-4 space-y-3">
        {post.caption && (
          <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal">
            {post.caption}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((t, idx) => (
              <span key={idx} className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-transform active:scale-125 ${
                hasLiked ? 'text-rose-500' : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <Link
              href={`/posts/${post.id}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-orange-600 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{post.comments_count || 0}</span>
            </Link>
          </div>

          {/* Connect Button */}
          {!isOwnCat && activeCat && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleConnect}
              isLoading={connecting}
              className="gap-1.5 rounded-full text-xs hover:border-orange-500 hover:text-orange-600"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Connect</span>
            </Button>
          )}
        </div>

        {connectMessage && (
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 text-right">
            {connectMessage}
          </p>
        )}
      </div>
    </Card>
  );
}
