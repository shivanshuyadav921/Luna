'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCatAction } from '@/actions/cats';
import { stripExifAndProcessImage } from '@/lib/security/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Camera, Sparkles, ShieldCheck } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);

  const MOOD_OPTIONS = ['😴 Sleepy', '😸 Playful', '🧐 Curious', '⚡ Energetic', '🥰 Loving', '👑 Regal', '📦 Box Inspector'];

  const [selectedMood, setSelectedMood] = useState('😸 Playful');

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Strips EXIF metadata before displaying/uploading
      const sanitizedBlob = await stripExifAndProcessImage(file, 600, 600, 0.85);
      const previewUrl = URL.createObjectURL(sanitizedBlob);
      setAvatarPreview(previewUrl);
      setAvatarBlob(sanitizedBlob);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error processing image';
      setError(message);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let avatarUrl = '';

    // Upload sanitized avatar blob to Supabase Storage if present
    if (avatarBlob) {
      try {
        const supabase = createClient();
        const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cat-avatars')
          .upload(fileName, avatarBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.warn('Supabase storage error:', uploadError.message);
          setError('Avatar upload failed: ' + uploadError.message + '. Please try again or skip the avatar.');
          setLoading(false);
          return;
        } else if (uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('cat-avatars')
            .getPublicUrl(uploadData.path);
          avatarUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        setError('Avatar upload failed unexpectedly. Please try again.');
        setLoading(false);
        return;
      }
    }

    const formData = new FormData(e.currentTarget);
    if (avatarUrl) {
      formData.set('avatarUrl', avatarUrl);
    }
    formData.set('mood', selectedMood);

    const res = await createCatAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/home');
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-100/30 dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Step 1: Public Identity</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-100">Create Your Cat Profile</h1>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            This is how other cat lovers will see you on Luna. Your human identity stays private.
          </p>
        </div>

        <Card className="p-4 border-amber-200 dark:border-neutral-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-center">Cat Companion Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-xs rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              {/* Avatar Photo Upload with EXIF Cleaner */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <Avatar src={avatarPreview} alt="Cat Avatar" size="xl" className="border-4 border-orange-400 shadow-md" />
                  <label className="absolute bottom-0 right-0 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full cursor-pointer shadow-md transition-transform group-hover:scale-110">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-neutral-500 text-center">
                  Upload a photo of your cat (EXIF & location headers auto-stripped)
                </p>
              </div>

              {/* Cat Name & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Cat Name *</label>
                  <Input name="name" placeholder="e.g. Luna" required />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Age (Years) *</label>
                  <Input name="ageYears" type="number" min="0" max="35" defaultValue="2" required />
                </div>
              </div>

              {/* Breed & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Breed (Optional)</label>
                  <Input name="breed" placeholder="e.g. British Shorthair, Ragdoll" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Country (3-letter)</label>
                  <Input name="countryCode" placeholder="IND, JPN, USA" maxLength={3} className="uppercase" />
                </div>
              </div>

              {/* Mood Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Current Mood</label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMood(m)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedMood === m
                          ? 'bg-orange-500 text-white font-bold shadow-xs'
                          : 'bg-amber-100/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-amber-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Cat Bio / Personality</label>
                <Textarea
                  name="bio"
                  rows={3}
                  placeholder="e.g. Currently judging everyone from the sunbeam. Master of nap positions."
                  maxLength={300}
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <span>Your private user identity (email, real name) remains completely hidden.</span>
              </div>

              <Button type="submit" isLoading={loading} className="w-full py-3.5 text-base font-bold rounded-2xl">
                Create Cat Profile & Enter Luna 🐾
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
