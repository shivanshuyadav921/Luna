'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signUpAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await signUpAction(formData);

    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setSuccess(res.success);
    }
    setLoading(false);
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
          <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">Join Luna</h1>
          <p className="text-xs text-neutral-500">Create your account to showcase your cat anonymously</p>
        </div>

        <Card className="p-2 border-amber-200 dark:border-neutral-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-base font-bold">Create Private Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-xs rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-medium">
                  {success}
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
                <p className="text-[11px] text-neutral-400">Used strictly for authentication. Never shown publicly.</p>
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

              <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-neutral-800/60 border border-amber-200/60 text-xs text-neutral-600 dark:text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Next step: You will create your cat&apos;s public profile!</span>
              </div>

              <Button type="submit" isLoading={loading} className="w-full py-3 font-bold rounded-2xl">
                Continue to Cat Profile →
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-amber-100 dark:border-neutral-800 text-center text-xs text-neutral-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-orange-600 hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
