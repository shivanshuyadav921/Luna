'use server';

import { createClient } from '@/lib/supabase/server';
import { ConnectionRequest, Connection } from '@/types';
import { revalidatePath } from 'next/cache';

export async function sendConnectionRequestAction(senderCatId: string, receiverCatId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  if (senderCatId === receiverCatId) {
    return { error: 'Cannot connect with your own cat profile.' };
  }

  // Verify sender cat belongs to current user
  const { data: senderCat } = await supabase
    .from('cats')
    .select('owner_id')
    .eq('id', senderCatId)
    .single();

  if (!senderCat || senderCat.owner_id !== user.id) {
    return { error: 'You do not own the sender cat profile.' };
  }

  // Prevent same-owner connections (two cats belonging to the same human)
  const { data: receiverCat } = await supabase
    .from('cats')
    .select('owner_id')
    .eq('id', receiverCatId)
    .single();

  if (receiverCat && receiverCat.owner_id === user.id) {
    return { error: 'You cannot connect two of your own cats together.' };
  }

  // Check if connection or pending request already exists
  const { data: existing } = await supabase
    .from('connection_requests')
    .select('id, status')
    .or(`and(sender_cat_id.eq.${senderCatId},receiver_cat_id.eq.${receiverCatId}),and(sender_cat_id.eq.${receiverCatId},receiver_cat_id.eq.${senderCatId})`)
    .single();

  if (existing) {
    if (existing.status === 'pending') return { error: 'Connection request already pending.' };
    if (existing.status === 'accepted') return { error: 'You are already connected.' };
  }

  const { data, error } = await supabase
    .from('connection_requests')
    .insert({
      sender_cat_id: senderCatId,
      receiver_cat_id: receiverCatId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/connections');
  return { success: true, request: data };
}

export async function acceptConnectionRequestAction(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  // Fetch request
  const { data: req } = await supabase
    .from('connection_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!req) return { error: 'Request not found.' };
  if (req.status !== 'pending') return { error: 'This request is no longer pending.' };

  // Security: verify current user owns the RECEIVER cat (not the sender)
  const { data: receiverCat } = await supabase
    .from('cats')
    .select('owner_id')
    .eq('id', req.receiver_cat_id)
    .single();

  if (!receiverCat || receiverCat.owner_id !== user.id) {
    return { error: 'You are not authorized to accept this request.' };
  }

  // Update status to accepted
  await supabase
    .from('connection_requests')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', requestId);

  // Canonical ordering: always put the lexicographically smaller UUID in cat_a_id
  // This ensures (A,B) and (B,A) always produce the same record, satisfying the CHECK constraint
  const [canonicalA, canonicalB] = [req.sender_cat_id, req.receiver_cat_id].sort();

  // Create connection record
  const { data: conn, error: connErr } = await supabase
    .from('connections')
    .insert({
      cat_a_id: canonicalA,
      cat_b_id: canonicalB,
    })
    .select()
    .single();

  if (connErr && !connErr.message.includes('unique') && !connErr.message.includes('duplicate')) {
    return { error: connErr.message };
  }

  if (conn) {
    // Create anonymous conversation
    await supabase.from('conversations').insert({
      connection_id: conn.id,
    });
  }

  revalidatePath('/connections');
  revalidatePath('/messages');
  return { success: true };
}

export async function declineConnectionRequestAction(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  await supabase
    .from('connection_requests')
    .update({ status: 'declined', updated_at: new Date().toISOString() })
    .eq('id', requestId);

  revalidatePath('/connections');
  return { success: true };
}

export async function getConnectionRequests(catId: string): Promise<ConnectionRequest[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('connection_requests')
    .select(`
      *,
      sender_cat:cats!connection_requests_sender_cat_id_fkey(*),
      receiver_cat:cats!connection_requests_receiver_cat_id_fkey(*)
    `)
    .eq('receiver_cat_id', catId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (data || []) as ConnectionRequest[];
}

export async function getConnectionsList(catId: string): Promise<Connection[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('connections')
    .select(`
      *,
      cat_a:cats!connections_cat_a_id_fkey(*),
      cat_b:cats!connections_cat_b_id_fkey(*)
    `)
    .or(`cat_a_id.eq.${catId},cat_b_id.eq.${catId}`)
    .order('created_at', { ascending: false });

  return (data || []) as Connection[];
}
