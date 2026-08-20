'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPostAction } from '@/actions/posts';
import { stripExifAndProcessImage } from '@/lib/security/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Camera, ShieldCheck, Sparkles } from 'lucide-react';
import { Cat } from '@/types';

export default function CreatePostPage() {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MOOD_OPTIONS = ['😴 Sleepy', '😸 Playful', '🧐 Curious', '⚡ Energetic', '🥰 Loving', '👑 Regal', '📦 Box Inspector'];
  const [selectedMood, setSelectedMood] = useState('😸 Playful');

  useEffect(() => {
    async function loadCats() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('cats').select('*').eq('owner_id', user.id);
        if (data && data.length > 0) {
          setCats(data as Cat[]);
          setSelectedCatId(data[0].id);
        }
      }
    }
    loadCats();
  }, []);

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Strips camera EXIF and GPS headers client-side before upload
      const sanitizedBlob = await stripExifAndProcessImage(file, 1600, 1600, 0.88);
      const previewUrl = URL.createObjectURL(sanitizedBlob);
      setImagePreview(previewUrl);
      setImageBlob(sanitizedBlob);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sanitize image.';
      setError(message);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!selectedCatId) {
      setError('Please select a cat profile first.');
      return;
    }

    if (!imageBlob && !imagePreview) {
      setError('Please select a cat photo.');
      return;
    }

    setLoading(true);

    let imageUrl = '';
    if (imageBlob) {
      try {
        const supabase = createClient();
        const fileName = `post_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cat-photos')
          .upload(fileName, imageBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          setError('Image upload failed: ' + uploadError.message + '. Please try again.');
          setLoading(false);
          return;
        } else if (uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('cat-photos')
            .getPublicUrl(uploadData.path);
          imageUrl = publicUrlData.publicUrl;
        }
      } catch {
        setError('Image upload failed unexpectedly. Please check your connection and try again.');
        setLoading(false);
        return;
      }
    }

    const formData = new FormData(e.currentTarget);
    formData.set('catId', selectedCatId);
    formData.set('imageUrl', imageUrl);
    formData.set('mood', selectedMood);

    const res = await createPostAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/home');
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-amber-50/50 dark:bg-neutral-950">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-100 flex items-center justify-center gap-2">
            <span>Post Today&apos;s Cat Photo</span>
            <Sparkles className="w-5 h-5 text-orange-500" />
          </h1>
          <p className="text-xs text-neutral-500">Share your cat&apos;s daily mood and keep your streak alive!</p>
        </div>

        <Card className="p-4 border-amber-200 dark:border-neutral-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-center">Daily Cat Story</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-xs rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              {/* Select Posting Cat */}
              {cats.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Posting Cat</label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {cats.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCatId(cat.id)}
                        className={`flex items-center gap-2 p-2 rounded-2xl border transition-all ${
                          selectedCatId === cat.id
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 font-bold'
                            : 'border-amber-200 dark:border-neutral-800 opacity-70'
                        }`}
                      >
                        <Avatar src={cat.avatar_url} alt={cat.name} size="sm" />
                        <span className="text-xs">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Upload Area */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Cat Photo *</label>
                <div className="relative aspect-16/10 w-full rounded-2xl border-2 border-dashed border-amber-300 dark:border-neutral-700 bg-amber-50/50 dark:bg-neutral-900 flex flex-col items-center justify-center overflow-hidden hover:border-orange-400 transition-colors">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <Camera className="w-8 h-8 text-orange-500 mx-auto" />
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Click to upload photo</p>
                      <p className="text-[10px] text-neutral-400">Camera & GPS location data auto-stripped for privacy</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Mood picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Cat&apos;s Mood Today</label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMood(m)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        selectedMood === m ? 'bg-orange-500 text-white font-bold' : 'bg-amber-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Caption</label>
                <Textarea
                  name="caption"
                  rows={3}
                  placeholder="e.g. She slept for six hours and is now tired from sleeping."
                  maxLength={500}
                />
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Tags (comma separated)</label>
                <Input name="tags" placeholder="e.g. napping, lazyday, orange cat" />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>EXIF metadata, device specs, and location headers are automatically erased.</span>
              </div>

              <Button type="submit" isLoading={loading} className="w-full py-3.5 font-bold rounded-2xl">
                Publish Cat Post 🐾
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
