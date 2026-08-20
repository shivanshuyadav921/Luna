'use client';

import React, { useState } from 'react';
import { PostComment, Cat } from '@/types';
import { addCommentAction } from '@/actions/posts';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import Link from 'next/link';

interface CommentSectionProps {
  postId: string;
  comments: PostComment[];
  activeCat?: Cat | null;
}

export function CommentSection({ postId, comments: initialComments, activeCat }: CommentSectionProps) {
  const [comments, setComments] = useState<PostComment[]>(initialComments);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !activeCat) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('postId', postId);
    formData.append('catId', activeCat.id);
    formData.append('content', content);

    const res = await addCommentAction(formData);
    if (res.error) {
      setError(res.error);
    } else if (res.comment) {
      setComments((prev) => [...prev, res.comment!]);
      setContent('');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4 pt-4 border-t border-amber-100 dark:border-neutral-800">
      <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
        Cat Comments ({comments.length})
      </h4>

      {/* Comment List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-xs text-neutral-500 italic py-2">No comments yet. Be the first cat to meow!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3 text-xs p-3 rounded-2xl bg-amber-50/60 dark:bg-neutral-800/60">
              <Avatar src={c.cat?.avatar_url} alt={c.cat?.name || 'Cat'} size="sm" />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <Link href={`/cats/${c.cat_id}`} className="font-bold text-neutral-900 dark:text-neutral-100 hover:underline">
                    {c.cat?.name || 'Anonymous Cat'}
                  </Link>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 leading-normal">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      {activeCat ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Avatar src={activeCat.avatar_url} alt={activeCat.name} size="sm" />
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Comment as ${activeCat.name}...`}
            className="flex-1 text-xs py-2"
          />
          <Button type="submit" size="sm" isLoading={loading} className="rounded-full px-3">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      ) : (
        <p className="text-xs text-neutral-500">Sign in and select a cat profile to leave a comment.</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
