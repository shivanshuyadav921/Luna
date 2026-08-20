'use server';

import { createClient } from '@/lib/supabase/server';
import { IdentityRevealRequest, IdentityRevealPermission } from '@/types';
import { revalidatePath } from 'next/cache';

export async function requestIdentityRevealAction(
  conversationId: string,
  requesterCatId: string,
  receiverCatId: string,
  permissions: {
    firstName?: string;
    country?: string;
    ageRange?: string;
    socialHandle?: string;
    bioNote?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  // 1. Create or update reveal request
  const { data: request, error: reqErr } = await supabase
    .from('identity_reveal_requests')
    .insert({
      conversation_id: conversationId,
      requester_cat_id: requesterCatId,
      receiver_cat_id: receiverCatId,
      status: 'pending',
    })
    .select()
    .single();

  if (reqErr) return { error: reqErr.message };

  // 2. Save requester's consented fields
  await supabase
    .from('identity_reveal_permissions')
    .upsert({
      conversation_id: conversationId,
      user_id: user.id,
      first_name: permissions.firstName || null,
      country: permissions.country || null,
      age_range: permissions.ageRange || null,
      social_handle: permissions.socialHandle || null,
      bio_note: permissions.bioNote || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'conversation_id,user_id' });

  revalidatePath(`/messages/${conversationId}`);
  return { success: true, request };
}

export async function respondToIdentityRevealAction(
  requestId: string,
  conversationId: string,
  accept: boolean,
  permissions?: {
    firstName?: string;
    country?: string;
    ageRange?: string;
    socialHandle?: string;
    bioNote?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  const status = accept ? 'accepted' : 'declined';

  // Update request status
  const { error } = await supabase
    .from('identity_reveal_requests')
    .update({
      status,
      responded_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) return { error: error.message };

  // Save receiver's consented fields if accepted
  if (accept && permissions) {
    await supabase
      .from('identity_reveal_permissions')
      .upsert({
        conversation_id: conversationId,
        user_id: user.id,
        first_name: permissions.firstName || null,
        country: permissions.country || null,
        age_range: permissions.ageRange || null,
        social_handle: permissions.socialHandle || null,
        bio_note: permissions.bioNote || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'conversation_id,user_id' });
  }

  revalidatePath(`/messages/${conversationId}`);
  return { success: true, status };
}

export async function getRevealStatusAndPermissions(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isRevealed: false, pendingRequest: null, permissions: [] };

  // Fetch reveal requests for this conversation
  const { data: requests } = await supabase
    .from('identity_reveal_requests')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false });

  const acceptedRequest = requests?.find((r) => r.status === 'accepted');
  const pendingRequest = requests?.find((r) => r.status === 'pending');

  let permissions: IdentityRevealPermission[] = [];
  if (acceptedRequest) {
    const { data: perms } = await supabase
      .from('identity_reveal_permissions')
      .select('*')
      .eq('conversation_id', conversationId);
    permissions = (perms || []) as IdentityRevealPermission[];
  }

  return {
    isRevealed: !!acceptedRequest,
    pendingRequest: (pendingRequest || null) as IdentityRevealRequest | null,
    permissions,
    currentUserId: user.id,
  };
}
