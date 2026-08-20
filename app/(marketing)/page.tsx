import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Heart, MessageSquare, Lock, Sparkles, ArrowRight, EyeOff, UserCheck, Flame } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default async function LandingPage() {
  // Redirect already-authenticated users straight to their feed
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/home');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/60 via-amber-100/20 to-orange-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Top Header Banner */}
      <header className="w-full py-4 px-6 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center text-xl shadow-md shadow-orange-500/20">
            🐱
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Luna
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="rounded-full shadow-md">
              Meet the Cats
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column Text */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-900 text-orange-800 dark:text-orange-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>Privacy-First Anonymous Social Network</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            Meet people through <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              their cats.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl font-normal leading-relaxed">
            Share your cat. Discover theirs. Make genuine connections without giving away who you are. Human identity stays private until both people explicitly agree to reveal.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 rounded-full text-base px-8 py-4 shadow-lg shadow-orange-500/25">
                <span>Meet the Cats</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full text-base px-8 py-4">
                How it works
              </Button>
            </Link>
          </div>

          {/* Value Badges */}
          <div className="pt-6 border-t border-amber-200/60 dark:border-neutral-800 grid grid-cols-3 gap-4 text-center lg:text-left">
            <div>
              <div className="font-extrabold text-xl text-neutral-900 dark:text-neutral-100">100%</div>
              <div className="text-xs text-neutral-500">Anonymous Start</div>
            </div>
            <div>
              <div className="font-extrabold text-xl text-neutral-900 dark:text-neutral-100">2-Way</div>
              <div className="text-xs text-neutral-500">Mutual Identity Reveal</div>
            </div>
            <div>
              <div className="font-extrabold text-xl text-neutral-900 dark:text-neutral-100">Zero</div>
              <div className="text-xs text-neutral-500">EXIF / GPS Exposure</div>
            </div>
          </div>
        </div>

        {/* Right Column Visual Example Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md">
            {/* Soft decorative glow behind card */}
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-amber-300 rounded-3xl blur-xl opacity-30 animate-pulse"></div>

            <Card className="relative overflow-hidden border-2 border-amber-200 dark:border-neutral-700 shadow-2xl rounded-3xl bg-white dark:bg-neutral-900">
              <div className="p-4 flex items-center justify-between border-b border-amber-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <Avatar src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600" alt="Luna" size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-neutral-900 dark:text-neutral-100">LUNA 🐱</span>
                      <span className="text-xs">🇮🇳</span>
                    </div>
                    <span className="text-xs text-neutral-500">2 years old • British Shorthair</span>
                  </div>
                </div>
                <Badge variant="amber" className="gap-1">
                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <span>28 days streak</span>
                </Badge>
              </div>

              {/* Photo */}
              <div className="relative aspect-4/3 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800"
                  alt="Luna photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span>😴 Sleepy</span>
                </div>
              </div>

              {/* Post Caption */}
              <div className="p-4 space-y-3">
                <p className="text-sm italic text-neutral-700 dark:text-neutral-300">
                  &quot;Currently judging everyone from her sunny nap spot.&quot;
                </p>

                <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-amber-100 dark:border-neutral-800">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-semibold text-rose-500">
                      <Heart className="w-4 h-4 fill-rose-500" /> 248
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-neutral-600 dark:text-neutral-400">
                      <MessageSquare className="w-4 h-4" /> 31
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full">
                    Luna&apos;s Corner
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* 3-Step Concept Section */}
      <section id="how-it-works" className="py-20 bg-white/70 dark:bg-neutral-900/70 border-y border-amber-200/60 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-neutral-900 dark:text-neutral-100">
              How Luna Works
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-400">
              A peaceful social journey designed around cat identities and controlled mutual trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="p-8 space-y-4 hover:shadow-lg transition-shadow border-amber-200/80">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl font-black">
                1
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">1. Share</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Create a profile for your cat. Post daily photos, moods, and captions. Your human name, email, and location are never exposed.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-8 space-y-4 hover:shadow-lg transition-shadow border-amber-200/80">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-black">
                2
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">2. Connect</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Interact with other cat owners anonymously. Like posts, exchange cat stories, and start private cat-to-cat conversations.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-8 space-y-4 hover:shadow-lg transition-shadow border-amber-200/80">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-black">
                3
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">3. Reveal</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                If BOTH people explicitly consent, you can choose to reveal selected human details (name, social handle, country) step-by-step.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Safety & Privacy Feature Callouts */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="green" className="gap-1.5 py-1 px-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety Model</span>
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
              Privacy by Design. <br /> Not an afterthought.
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-neutral-800 text-orange-600">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-neutral-900 dark:text-neutral-100">Zero EXIF Leakage</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Uploaded cat photos are automatically scrubbed of all GPS coordinates and camera metadata before saving.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-neutral-800 text-amber-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-neutral-900 dark:text-neutral-100">2-Way Mutual Consent</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Identity reveal requires affirmative consent from both sides. One-sided requests reveal nothing.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-neutral-800 text-emerald-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-neutral-900 dark:text-neutral-100">Instant Block & Report</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Users can block or report any participant instantly. Blocked users cannot message or discover your cats.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-neutral-800 dark:to-neutral-900 p-8 rounded-3xl border border-amber-200 dark:border-neutral-700 space-y-6">
            <h3 className="font-black text-2xl text-neutral-900 dark:text-neutral-100">Ready to join Luna?</h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Create a profile for your feline companion and start exploring cat stories from all around the world today.
            </p>
            <Link href="/signup" className="block">
              <Button size="lg" className="w-full py-4 rounded-2xl font-bold shadow-lg">
                Create Cat Profile 🐾
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
