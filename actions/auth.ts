'use server';

import { createClient } from '@/lib/supabase/server';
import { authSchema } from '@/lib/validation/schemas';
import { redirect } from 'next/navigation';

/**
 * Returns the absolute callback URL for the current environment.
 * Uses NEXT_PUBLIC_SITE_URL in production (Vercel) and falls back
 * to localhost for local development.
 */
function getCallbackUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    // Trim trailing slash to avoid double slashes
    return `${siteUrl.replace(/\/$/, '')}/callback`;
  }
  // Fallback for local development
  return 'http://localhost:3000/callback';
}

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
    options: {
      // Ensures the email confirmation link redirects to the right domain in production
      emailRedirectTo: getCallbackUrl(),
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect('/onboarding');
  }

  return { success: 'Check your email for a confirmation link, then sign in.' };
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

export async function signInWithGoogleAction() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Must point to your production domain in Vercel.
      // Supabase will redirect here after Google authenticates the user.
      redirectTo: getCallbackUrl(),
      queryParams: {
        // Prompt the Google account picker every time for a better UX
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('[Luna] Google OAuth initiation error:', error.message);
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: 'Failed to initiate Google sign-in. Please try again.' };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
