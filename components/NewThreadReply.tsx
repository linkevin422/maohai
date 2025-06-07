'use client';

import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { createComment } from '@/lib/forum';
import { useText } from '@/lib/getText';

interface Props {
  postId: string;
  onAdded: () => void;          // 👈 NEW
}

export default function NewThreadReply({ postId, onAdded }: Props) {
  const { getText } = useText();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await createComment({ post_id: postId, parent_id: null, content: text.trim() });
    setText('');
    setSaving(false);
    onAdded();                  // 👈 refresh tree instantly
  };

  return (
    <section className="my-10">
      <h3 className="text-sm font-semibold text-zinc-700 mb-2">
        {getText('add_comment_label')}
      </h3>
      <TextareaAutosize
        minRows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={getText('share_thoughts_placeholder')}
        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <button
        disabled={saving}
        onClick={submit}
        className="mt-3 px-5 py-2 rounded-md text-sm font-medium bg-amber-500 text-white shadow-sm hover:bg-amber-600 disabled:opacity-50"
      >
        {saving ? getText('posting_btn') : getText('post_btn')}
      </button>
    </section>
  );
}
