'use client';

import React, { useState } from 'react';
import { reportContentAction } from '@/actions/safety';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ShieldAlert, X } from 'lucide-react';

interface ReportModalProps {
  reportedUserId?: string;
  reportedPostId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ reportedUserId, reportedPostId, isOpen, onClose }: ReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    if (reportedUserId) formData.set('reportedUserId', reportedUserId);
    if (reportedPostId) formData.set('reportedPostId', reportedPostId);

    const res = await reportContentAction(formData);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setSuccess(res.success);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <Card className="w-full max-w-md p-6 space-y-4 relative border-amber-200 dark:border-neutral-800 shadow-2xl bg-white dark:bg-neutral-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 text-center">
          <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Submit Safety Report</h3>
          <p className="text-xs text-neutral-500">Reports are confidential and reviewed server-side.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-xl">{error}</p>}
          {success && <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-xl">{success}</p>}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
            <select
              name="category"
              className="w-full px-3 py-2 rounded-2xl border border-amber-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs"
              required
            >
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="harassment">Harassment or Stalking</option>
              <option value="spam">Spam or Unsolicited Promotion</option>
              <option value="impersonation">Impersonation</option>
              <option value="hate">Hate Speech</option>
              <option value="other">Other Concern</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Details</label>
            <Textarea
              name="description"
              rows={3}
              placeholder="Describe the issue..."
              required
            />
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-2.5 font-bold rounded-2xl">
            Submit Report 🛡️
          </Button>
        </form>
      </Card>
    </div>
  );
}
