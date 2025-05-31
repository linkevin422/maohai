'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';

function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) return reject("No image result");
      img.src = e.target.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("Canvas failed");

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject("Failed to convert to webp");
        },
        'image/webp',
        0.8
      );
    };

    reader.readAsDataURL(file);
  });
}

export default function ArticleSubmissionPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
    ],
    content: '',
  });

  useEffect(() => {
    if (!slugTouched) {
      const gen = title
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-]/g, '');
      setSlug(gen);
    }
  }, [title]);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || tags.includes(tag) || tags.length >= 3) return;
    setTags([...tags, tag]);
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const insertImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = async () => {
      if (!input.files || !input.files[0]) return;
      const webp = await convertToWebP(input.files[0]);
      const filename = `${Date.now()}.webp`;

      const { error } = await supabase.storage
        .from('article-images')
        .upload(filename, webp, {
          contentType: 'image/webp',
        });

      if (error) return alert('Upload failed');

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-images/${filename}`;
      editor?.chain().focus().setImage({ src: url }).run();
    };
  };

  const handleSubmit = async () => {
    if (!title || !slug || !editor?.getHTML()) {
      setError('Missing title, slug or content');
      return;
    }

    const { error } = await supabase.from('articles').insert({
      title,
      slug,
      tags,
      content: editor.getHTML(),
    });

    if (error) {
      setError('Submit failed');
      console.error(error);
    } else {
      setSuccess(true);
      setTitle('');
      setSlug('');
      setSlugTouched(false);
      setTags([]);
      setTagInput('');
      editor?.commands.clearContent();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📝 Submit New Article</h1>

      <label className="block mb-2 font-medium">Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter your article title"
        className="w-full px-4 py-2 mb-4 rounded bg-white/10 border border-white/20"
      />

      <label className="block mb-2 font-medium">Slug (URL part)</label>
      <input
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
          setSlugTouched(true);
        }}
        className="w-full px-4 py-2 mb-2 rounded bg-white/10 border border-white/20"
      />

      <p className="mb-6 text-sm opacity-70 -mt-3">
        URL: <span className="text-green-400">maohai.tw/article/{slug || '...'}</span>
      </p>

      <label className="block mb-2 font-medium">Tags (max 3)</label>
      <div className="flex gap-2 mb-3">
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Add a tag"
          className="flex-1 px-4 py-2 rounded bg-white/10 border border-white/20"
        />
        <button
          onClick={handleAddTag}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700"
        >
          Add
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {tags.map((tag) => (
          <div
            key={tag}
            className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-4">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className="px-3 py-1 bg-white/10 border border-white/20 rounded">Bold</button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-3 py-1 bg-white/10 border border-white/20 rounded">Italic</button>
        <button onClick={() => editor?.chain().focus().setHorizontalRule().run()} className="px-3 py-1 bg-white/10 border border-white/20 rounded">Divider</button>
        <button onClick={insertImage} className="px-3 py-1 bg-white/10 border border-white/20 rounded">Insert Image</button>
      </div>

      <div className="mb-6 bg-white text-black rounded min-h-[300px] p-4">
        <EditorContent editor={editor} />
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">Article submitted!</p>}

      <button
        onClick={handleSubmit}
        className="px-6 py-2 rounded bg-green-600 hover:bg-green-700"
      >
        Submit Article
      </button>
    </div>
  );
}
