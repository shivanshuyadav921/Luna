'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signInAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

        <Card className="p-2 border-amber-200 dark:border-neutral-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-base font-bold">Sign In to Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

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

            <div className="mt-6 pt-4 border-t border-amber-100 dark:border-neutral-800 text-center text-xs text-neutral-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-bold text-orange-600 hover:underline">
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
