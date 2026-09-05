'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signInAction, signInWithGoogleAction } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lock, Mail } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Inner component that uses useSearchParams — must be inside <Suspense>.
 * This is required by Next.js App Router because useSearchParams suspends
 * during static prerendering (search params are not known at build time).
 */
function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const callbackError = searchParams.get('error');
  const displayError = error || (callbackError ? decodeURIComponent(callbackError) : null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await signInAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);

    try {
      // Use client-side OAuth so the PKCE code verifier is stored directly in browser cookies,
      // and redirect target accurately matches current host (localhost or production Vercel)
      const supabase = createClient();
      const nextParam = searchParams.get('next');
      const safeNextParam =
        nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : null;
      const redirectUrl = safeNextParam
        ? `${window.location.origin}/callback?next=${encodeURIComponent(safeNextParam)}`
        : `${window.location.origin}/callback`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        // Fallback to server action if client call encountered an issue
        console.warn('[Luna] Client OAuth failed, falling back to server action:', oauthError.message);
        const res = await signInWithGoogleAction();
        if (res?.error) {
          setError(res.error);
          setGoogleLoading(false);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start Google sign-in';
      setError(msg);
      setGoogleLoading(false);
    }
  }

  return (
    <Card className="p-2 border-amber-200 dark:border-neutral-800 shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-base font-bold">Sign In to Your Account</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayError && (
            <div className="p-3 text-xs rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-medium">
              {displayError}
            </div>
          )}

          {/* Google Sign-In */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            isLoading={googleLoading}
            className="w-full py-3 font-semibold rounded-2xl border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-3"
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-amber-100 dark:bg-neutral-800" />
            <span className="text-[11px] text-neutral-400 font-semibold">or sign in with email</span>
            <div className="flex-1 h-px bg-amber-100 dark:bg-neutral-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="next" value={searchParams.get('next') || ''} />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <Input
                  name="email"
                  type="email"
                  placeholder="catlover@example.com"
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-3 font-bold rounded-2xl">
              Sign In 🐾
            </Button>
          </form>
        </div>

        <div className="mt-6 pt-4 border-t border-amber-100 dark:border-neutral-800 text-center text-xs text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold text-orange-600 hover:underline">
            Create Account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-amber-50 to-orange-100/40 dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl shadow-lg">
              🐱
            </div>
            <span className="font-extrabold text-3xl text-orange-600">Luna</span>
          </Link>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">Welcome Back</h1>
          <p className="text-xs text-neutral-500">Sign in to manage your cat profiles and conversations</p>
        </div>

        {/* Suspense required by Next.js App Router for useSearchParams() */}
        <Suspense fallback={
          <Card className="p-2 border-amber-200 dark:border-neutral-800 shadow-xl">
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </Card>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
