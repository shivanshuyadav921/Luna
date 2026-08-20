'use server';

import { createClient } from '@/lib/supabase/server';
import { postSchema, commentSchema } from '@/lib/validation/schemas';
import { Post, PostComment } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createPostAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  const catId = formData.get('catId') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const caption = formData.get('caption') as string;
  const mood = formData.get('mood') as string;
  const rawTags = formData.get('tags') as string;

  const tags = rawTags ? rawTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];

  const parseResult = postSchema.safeParse({ catId, imageUrl, caption, mood, tags });
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  // Application-layer ownership check (defence-in-depth alongside RLS)
  const { data: ownedCat } = await supabase
    .from('cats')
    .select('id')
    .eq('id', catId)
    .eq('owner_id', user.id)
    .single();

  if (!ownedCat) {
    return { error: 'You do not own this cat profile.' };
  }

  // Insert post
  const { data, error } = await supabase
    .from('posts')
    .insert({
      cat_id: catId,
      image_url: imageUrl,
      caption: caption || null,
      mood: mood || null,
      tags: tags,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Compute streak based on last_posted_at
  const { data: catData } = await supabase
    .from('cats')
    .select('streak_count, last_posted_at')
    .eq('id', catId)
    .single();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastPosted = catData?.last_posted_at ? new Date(catData.last_posted_at) : null;
  const lastPostedDay = lastPosted
    ? new Date(lastPosted.getFullYear(), lastPosted.getMonth(), lastPosted.getDate())
    : null;

  const msPerDay = 86400000;
  const daysSinceLast = lastPostedDay ? (today.getTime() - lastPostedDay.getTime()) / msPerDay : Infinity;

  let newStreak = 1;
  if (daysSinceLast === 0) {
    // Already posted today — don't change streak
    newStreak = catData?.streak_count ?? 1;
  } else if (daysSinceLast === 1) {
    // Posted yesterday — extend streak
    newStreak = (catData?.streak_count ?? 0) + 1;
  }
  // else: more than 1 day gap — streak resets to 1

  await supabase
    .from('cats')
    .update({
      last_posted_at: now.toISOString(),
      streak_count: newStreak,
    })
    .eq('id', catId);

  revalidatePath('/home');
  revalidatePath('/discover');
  return { success: true, post: data as Post };
}

export async function getHomeFeed(limit = 10, offset = 0): Promise<Post[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch blocked user IDs so we can exclude their posts
  let blockedOwnerIds: string[] = [];
  if (user) {
    const { data: blocks } = await supabase
      .from('blocks')
      .select('blocked_user_id')
      .eq('blocker_user_id', user.id);
    if (blocks) {
      blockedOwnerIds = blocks.map((b) => b.blocked_user_id);
    }
  }

  let query = supabase
    .from('posts')
    .select(`*, cat:cats!inner(*)`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Exclude posts from blocked users (filter via joined cats.owner_id)
  if (blockedOwnerIds.length > 0) {
    query = query.not('cat.owner_id', 'in', `(${blockedOwnerIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  // Check if current user has liked posts
  let likedPostIds = new Set<string>();
  if (user) {
    const postIds = data.map((p) => p.id);
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds);

    if (likes) {
      likedPostIds = new Set(likes.map((l) => l.post_id));
    }
  }

  return data.map((post) => ({
    ...post,
    user_has_liked: likedPostIds.has(post.id),
  })) as Post[];
}


export async function getDiscoverPosts(filter = 'today'): Promise<Post[]> {
  const supabase = await createClient();

  let query = supabase.from('posts').select(`*, cat:cats(*)`);

  if (filter === 'rising') {
    query = query.order('likes_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data } = await query.limit(20);
  return (data || []) as Post[];
}

export async function getPostById(postId: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('posts')
    .select(`*, cat:cats(*)`)
    .eq('id', postId)
    .single();

  if (!data) return null;

  let user_has_liked = false;
  if (user) {
    const { data: like } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();
    if (like) user_has_liked = true;
  }

  return { ...data, user_has_liked } as Post;
}

export async function toggleLikePostAction(postId: string, catId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  // Check if like exists
  const { data: existingLike } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existingLike) {
    await supabase.from('post_likes').delete().eq('id', existingLike.id);
  } else {
    await supabase.from('post_likes').insert({
      post_id: postId,
      user_id: user.id,
      cat_id: catId,
    });
  }

  revalidatePath('/home');
  revalidatePath(`/posts/${postId}`);
  return { success: true };
}

export async function addCommentAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  const postId = formData.get('postId') as string;
  const catId = formData.get('catId') as string;
  const content = formData.get('content') as string;

  const parseResult = commentSchema.safeParse({ postId, catId, content });
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      cat_id: catId,
      content: parseResult.data.content,
    })
    .select(`*, cat:cats(*)`)
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/posts/${postId}`);
  return { success: true, comment: data as PostComment };
}

export async function getPostComments(postId: string): Promise<PostComment[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('post_comments')
    .select(`*, cat:cats(*)`)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  return (data || []) as PostComment[];
}
