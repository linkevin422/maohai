'use client';

import { useEffect, useRef, useState } from 'react';
import { createPost } from '@/lib/forum';
import { slugify } from '@/lib/slugify';
import { useRouter } from 'next/navigation';
import TextareaAutosize from 'react-textarea-autosize';
import { X } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NewPostModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const first = useRef<HTMLInputElement | null>(null);

  /* autofocus on open */
  useEffect(() => {
    if (open) {
      setTimeout(() => first.current?.focus(), 0);
    } else {
      setTitle('');
      setContent('');
      setSaving(false);
    }
  }, [open]);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      /* ensure user is logged in */
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      /* insert post */
      const post = await createPost({
        slug: slugify(title),
        title: title.trim(),
        content: content.trim(),
      });

      onClose();
      router.push(`/m/${post.slug}`);
    } catch (err: any) {
      console.error('Post insert failed:', err);
      alert(err?.message ?? JSON.stringify(err));
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-900 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create a post</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <input
          ref={first}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full mb-4 rounded bg-neutral-800 p-2 text-sm"
        />

        <TextareaAutosize
          minRows={6}
          value={content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setContent(e.target.value)
          }
          placeholder="Content (markdown accepted)…"
          className="w-full rounded bg-neutral-800 p-2 text-sm"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={submit}
            className="px-4 py-1 rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-50"
          >
            {saving ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
