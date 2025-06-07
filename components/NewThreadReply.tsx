'use client';

import { useState } from 'react';
import { createComment } from '@/lib/forum';
import TextareaAutosize from 'react-textarea-autosize';

export default function NewThreadReply({ postId }: { postId: string }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await createComment({
      post_id: postId,
      parent_id: null,
      content: text.trim(),
    });
    window.location.reload();
  };

  return (
    <div className="my-6">
      <h3 className="text-sm font-semibold mb-2">Add a comment</h3>
      <TextareaAutosize
        minRows={3}
        value={text}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setText(e.target.value)
        }
        className="w-full rounded-lg bg-neutral-800 p-2 text-sm"
        placeholder="Share your thoughts…"
      />
      <button
        disabled={saving}
        onClick={submit}
        className="mt-2 px-4 py-1 rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-50"
      >
        {saving ? 'Posting…' : 'Post'}
      </button>
    </div>
  );
}
