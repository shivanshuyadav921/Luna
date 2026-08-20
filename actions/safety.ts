'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { reportSchema } from '@/lib/validation/schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function blockUserAction(blockedUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  const { error } = await supabase.from('blocks').insert({
    blocker_user_id: user.id,
    blocked_user_id: blockedUserId,
  });

  if (error && !error.message.includes('unique')) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  revalidatePath('/home');
  return { success: true };
}

export async function unblockUserAction(blockedUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  await supabase
    .from('blocks')
    .delete()
    .eq('blocker_user_id', user.id)
    .eq('blocked_user_id', blockedUserId);

  revalidatePath('/settings');
  return { success: true };
}

export async function reportContentAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const reportedUserId = formData.get('reportedUserId') as string || undefined;
  const reportedPostId = formData.get('reportedPostId') as string || undefined;

  const parseResult = reportSchema.safeParse({ category, description, reportedUserId, reportedPostId });
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_user_id: reportedUserId || null,
    reported_post_id: reportedPostId || null,
    category: parseResult.data.category,
    description: parseResult.data.description,
  });

  if (error) return { error: error.message };

  return { success: 'Report submitted safely. Our moderation team will review.' };
}

export async function deleteAccountAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  try {
    // Use the admin client to delete the auth user.
    // This cascades to user_profiles, cats, posts, messages, etc. via FK ON DELETE CASCADE.
    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError);
      return { error: 'Failed to delete account. Please try again or contact support.' };
    }
  } catch (err) {
    console.error('Admin client error during account deletion:', err);
    return { error: 'Account deletion service is temporarily unavailable.' };
  }

  // Sign out the session after deletion
  await supabase.auth.signOut();
  redirect('/signup');
}
