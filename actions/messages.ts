'use server';

import { createClient } from '@/lib/supabase/server';
import { messageSchema } from '@/lib/validation/schemas';
import { Conversation, Message } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getConversationsList(catId: string): Promise<Conversation[]> {
  const supabase = await createClient();

  // Fetch connections where the active cat is participant, then get their conversations
  const { data: connections, error: connErr } = await supabase
    .from('connections')
    .select('id, cat_a_id, cat_b_id')
    .or(`cat_a_id.eq.${catId},cat_b_id.eq.${catId}`);

  if (connErr || !connections || connections.length === 0) return [];

  const connectionIds = connections.map((c) => c.id);

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      connection:connections!conversations_connection_id_fkey(
        *,
        cat_a:cats!connections_cat_a_id_fkey(*),
        cat_b:cats!connections_cat_b_id_fkey(*)
      )
    `)
    .in('connection_id', connectionIds)
    .order('last_message_at', { ascending: false });

  if (error || !data) return [];

  return data.map((conv) => {
    const conn = conv.connection;
    const other_cat = conn?.cat_a_id === catId ? conn.cat_b : conn.cat_a;
    return {
      ...conv,
      other_cat,
    };
  }) as Conversation[];
}


export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('messages')
    .select(`*, sender_cat:cats(*)`)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return (data || []) as Message[];
}

export async function sendMessageAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required.' };

  const conversationId = formData.get('conversationId') as string;
  const senderCatId = formData.get('senderCatId') as string;
  const content = formData.get('content') as string;

  const parseResult = messageSchema.safeParse({ conversationId, senderCatId, content });
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_cat_id: senderCatId,
      content: parseResult.data.content,
    })
    .select(`*, sender_cat:cats(*)`)
    .single();

  if (error) return { error: error.message };

  // Update conversation last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  revalidatePath(`/messages/${conversationId}`);
  return { success: true, message: data as Message };
}
