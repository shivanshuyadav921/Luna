'use client';

import React, { useState } from 'react';
import { requestIdentityRevealAction, respondToIdentityRevealAction } from '@/actions/identity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ShieldCheck, UserCheck, Eye, X } from 'lucide-react';
import { IdentityRevealRequest } from '@/types';

interface IdentityRevealModalProps {
  conversationId: string;
  requesterCatId: string;
  receiverCatId: string;
  pendingRequest?: IdentityRevealRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IdentityRevealModal({
  conversationId,
  requesterCatId,
  receiverCatId,
  pendingRequest,
  isOpen,
  onClose,
}: IdentityRevealModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Field consent selections
  const [firstName, setFirstName] = useState('');
  const [country, setCountry] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [bioNote, setBioNote] = useState('');

  if (!isOpen) return null;

  const isResponding = !!pendingRequest;

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await requestIdentityRevealAction(
      conversationId,
      requesterCatId,
      receiverCatId,
      { firstName, country, ageRange, socialHandle, bioNote }
    );

    if (res.error) {
      setError(res.error);
    } else {
      onClose();
    }
    setLoading(false);
  }

  async function handleRespond(accept: boolean) {
    if (!pendingRequest) return;
    setLoading(true);
    setError(null);

    const res = await respondToIdentityRevealAction(
      pendingRequest.id,
      conversationId,
      accept,
      accept ? { firstName, country, ageRange, socialHandle, bioNote } : undefined
    );

    if (res.error) {
      setError(res.error);
    } else {
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <Card className="w-full max-w-lg p-6 space-y-6 relative border-amber-200 dark:border-neutral-800 shadow-2xl bg-white dark:bg-neutral-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
            {isResponding ? 'Respond to Identity Reveal' : 'Would you like to know each other?'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Identity reveal requires <strong>2-way mutual consent</strong>. Only the specific information you explicitly check below will be revealed.
          </p>
        </div>

        <form onSubmit={handleSendRequest} className="space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-xl">{error}</p>}

          <div className="space-y-3 p-4 rounded-2xl bg-amber-50/70 dark:bg-neutral-800/60 border border-amber-200/60 dark:border-neutral-700 text-xs">
            <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
              <span>Select Information You Consent to Share</span>
              <Eye className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="space-y-2 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-neutral-600">First Name (Optional)</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="mt-1 text-xs py-1.5"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-600">Age Range (Optional)</label>
                <Input
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  placeholder="e.g. 25-30"
                  className="mt-1 text-xs py-1.5"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-600">Country / Region (Optional)</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Japan, United States"
                  className="mt-1 text-xs py-1.5"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-600">Social Handle / Contact (Optional)</label>
                <Input
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="e.g. @catlover_alex on Instagram / Discord"
                  className="mt-1 text-xs py-1.5"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-600">Bio Note (Optional)</label>
                <Input
                  value={bioNote}
                  onChange={(e) => setBioNote(e.target.value)}
                  placeholder="e.g. Architect living in Tokyo with Mochi."
                  className="mt-1 text-xs py-1.5"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[11px] text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>If either person declines or cancels, no personal information will ever be transmitted.</span>
          </div>

          {isResponding ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleRespond(false)}
                isLoading={loading}
                className="w-full text-xs py-2.5 rounded-2xl"
              >
                Decline / Not Now
              </Button>
              <Button
                type="button"
                onClick={() => handleRespond(true)}
                isLoading={loading}
                className="w-full text-xs py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                Accept & Reveal Selected 🐾
              </Button>
            </div>
          ) : (
            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-3 text-sm font-bold rounded-2xl"
            >
              Send Identity Reveal Request 🐾
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}
