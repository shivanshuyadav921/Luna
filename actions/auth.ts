'use server';

import { createClient } from '@/lib/supabase/server';
import { authSchema } from '@/lib/validation/schemas';
import { redirect } from 'next/navigation';

/**
 * Returns the absolute callback URL for the current environment.
 * Uses NEXT_PUBLIC_SITE_URL or Vercel system domain in production,
 * and falls back to localhost for local development.
 */
function getCallbackUrl(): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined);

  if (siteUrl) {
    // Trim trailing slash to avoid double slashes
    return `${siteUrl.replace(/\/$/, '')}/callback`;
  }
  // Fallback for local development
  return 'http://localhost:3000/callback';
}

export async function signUpAction(formData: FormData) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      error:
        'Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required. Please add them in Vercel Dashboard → Project Settings → Environment Variables.',
    };
  }

  const email = ((formData.get('email') as string) || '').trim().toLowerCase();
  const password = (formData.get('password') as string) || '';
  const confirmPassword = formData.get('confirmPassword') as string | null;

  if (confirmPassword !== null && confirmPassword !== undefined && confirmPassword !== password) {
    return { error: 'Passwords do not match.' };
  }

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

  // Supabase returns an empty identities array when email enumeration prevention is ON
  // and an account with this email already exists (e.g., via password or Google OAuth).
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return {
      error: 'An account with this email already exists. Please sign in with your password or continue with Google.',
    };
  }

  // If email confirmation is disabled in Supabase, an active session is returned immediately
  if (data.session) {
    if (data.user) {
      const { data: cats } = await supabase
        .from('cats')
        .select('id')
        .eq('owner_id', data.user.id)
        .limit(1);

      if (cats && cats.length > 0) {
        redirect('/home');
      }
    }
    redirect('/onboarding');
  }

  return {
    success: 'Account created! Please check your email for a confirmation link to activate your account.',
  };
}

export async function signInAction(formData: FormData) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      error:
        'Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required. Please add them in Vercel Dashboard → Project Settings → Environment Variables.',
    };
  }

  const email = ((formData.get('email') as string) || '').trim().toLowerCase();
  const password = (formData.get('password') as string) || '';

  const parseResult = authSchema.safeParse({ email, password });
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return {
        error:
          'Invalid email or password. If you originally signed up with Google, please click "Continue with Google".',
      };
    }
    if (error.message.includes('Email not confirmed')) {
      return {
        error:
          'Your email has not been confirmed yet. Please check your inbox for the confirmation link.',
      };
    }
    return { error: error.message };
  }

  // Check whether this user has already created a cat profile.
  // If not, guide them straight to onboarding.
  if (data?.user) {
    const { data: cats } = await supabase
      .from('cats')
      .select('id')
      .eq('owner_id', data.user.id)
      .limit(1);

    if (!cats || cats.length === 0) {
      redirect('/onboarding');
    }
  }

  const rawNext = formData.get('next') as string | null;
  const safeNext =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/home';

  redirect(safeNext);
}

export async function signInWithGoogleAction() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      error:
        'Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required. Please add them in Vercel Dashboard → Project Settings → Environment Variables.',
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Must point to your production domain in Vercel.
      // Supabase will redirect here after Google authenticates the user.
      redirectTo: getCallbackUrl(),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('[Luna] Google OAuth initiation error:', error.message);
    return { error: error.message };
  }

  if (data?.url) {
    redirect(data.url);
  }

  return { error: 'Failed to initiate Google sign-in. Please try again.' };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
