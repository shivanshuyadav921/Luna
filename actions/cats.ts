'use server';

import { createClient } from '@/lib/supabase/server';
import { catProfileSchema } from '@/lib/validation/schemas';
import { Cat } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createCatAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be signed in to create a cat profile.' };
  }

  const rawData = {
    name: formData.get('name') as string,
    ageYears: formData.get('ageYears'),
    breed: formData.get('breed') as string,
    gender: formData.get('gender') as string,
    countryCode: formData.get('countryCode') as string,
    bio: formData.get('bio') as string,
    mood: formData.get('mood') as string || '😸 Happy',
    avatarUrl: formData.get('avatarUrl') as string,
  };

  const parseResult = catProfileSchema.safeParse(rawData);
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const validated = parseResult.data;

  const { data, error } = await supabase
    .from('cats')
    .insert({
      owner_id: user.id,
      name: validated.name,
      age_years: validated.ageYears,
      breed: validated.breed || null,
      gender: validated.gender || null,
      country_code: validated.countryCode || null,
      bio: validated.bio || null,
      mood: validated.mood || '😸 Happy',
      avatar_url: validated.avatarUrl || null,
      streak_count: 1,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/home');
  return { success: true, cat: data as Cat };
}

export async function getUserCats(): Promise<Cat[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('cats')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (data || []) as Cat[];
}

export async function getCatById(catId: string): Promise<Cat | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('cats')
    .select('*')
    .eq('id', catId)
    .single();

  return (data || null) as Cat | null;
}
