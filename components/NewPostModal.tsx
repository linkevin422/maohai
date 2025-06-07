'use client';

import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { createPost } from '@/lib/forum';
import { slugify } from '@/lib/slugify';
import { useText } from '@/lib/getText';

export default function NewPostModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { getText } = useText();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const firstInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInput.current?.focus(), 0);
    } else {
      setTitle('');
      setContent('');
      setSaving(false);
    }
  }, [open]);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const post = await createPost({
        slug: slugify(title),
        title: title.trim(),
        content: content.trim(),
      });
      onClose();
      router.push(`/m/${post.slug}`);
    } catch (err: any) {
      console.error('Create post failed:', err);
      alert(err?.message ?? JSON.stringify(err));
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className="
          w-full max-w-lg rounded-2xl p-6
          bg-white dark:bg-zinc-900
          text-zinc-900 dark:text-white
          shadow-xl ring-1 ring-black/10 dark:ring-white/10
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">{getText('create_post')}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <input
          ref={firstInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={getText('title_placeholder')}
          className="
            w-full mb-4 rounded-md px-4 py-2 text-sm
            bg-zinc-100 dark:bg-zinc-800
            placeholder-zinc-400 dark:placeholder-zinc-500
            focus:outline-none focus:ring-2 focus:ring-amber-500
          "
        />

        {/* Content */}
        <TextareaAutosize
          minRows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={getText('content_placeholder')}
          className="
            w-full rounded-md px-4 py-2 text-sm resize-none
            bg-zinc-100 dark:bg-zinc-800
            placeholder-zinc-400 dark:placeholder-zinc-500
            focus:outline-none focus:ring-2 focus:ring-amber-500
          "
        />

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
              px-5 py-2 rounded-md text-sm font-medium
              bg-zinc-200 hover:bg-zinc-300
              dark:bg-zinc-700 dark:hover:bg-zinc-600
              text-zinc-800 dark:text-white
            "
          >
            {getText('cancel')}
          </button>

          <button
            disabled={saving}
            onClick={submit}
            className="
              px-6 py-2 rounded-md text-sm font-medium
              bg-amber-500 hover:bg-amber-600
              text-white disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          >
            {saving ? getText('posting') : getText('post')}
          </button>
        </div>
      </div>
    </div>
  );
}
