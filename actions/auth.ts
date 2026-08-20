'use server';

import { createClient } from '@/lib/supabase/server';
import { authSchema } from '@/lib/validation/schemas';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const parseResult = authSchema.safeParse({ email, password });
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect('/onboarding');
  }

  return { success: 'Check your email for confirmation link or proceed to log in.' };
}

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const parseResult = authSchema.safeParse({ email, password });
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/home');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
