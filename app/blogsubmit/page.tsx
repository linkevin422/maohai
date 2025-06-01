'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createClientComponentClient();
import slugify from 'slugify';
import { admins } from '@/lib/admins';

export default function BlogSubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get('edit');

  const [userName, setUserName] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverPublicId, setCoverPublicId] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: '<p>Start writing here...</p>',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      const username = data.user?.user_metadata?.username || null;
      setUserName(username);
      setAuthChecked(true);

      if (!admins.includes(username || '')) {
        router.push('/');
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (!editingId || !editor) {
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', editingId)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setTitle(data.title);
      setCoverUrl(data.cover_image_url);
      setCoverPublicId(data.image_public_id);
      setCategory(data.category || '');
      setTags((data.tags || []).join(', '));
      editor.commands.setContent(data.content || '');
      setLoading(false);
    };

    fetchBlog();
  }, [editingId, editor]);

  const handleCoverUpload = async (file: File) => {
    const result = await uploadToCloudinary(file);
    if (result) {
      setCoverUrl(result.url);
      setCoverPublicId(result.public_id);
    }
  };

  const handleInsertImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const result = await uploadToCloudinary(file);
      if (result) editor?.commands.setImage({ src: result.url });
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!title || !editor?.getHTML() || !coverUrl || !coverPublicId) {
      alert('Missing fields');
      return;
    }

    setSubmitting(true);

    const content = editor.getHTML();
    const slug = slugify(title, { lower: true });
    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((t) => t);

    let result;
    if (editingId) {
      result = await supabase
        .from('blogs')
        .update({
          title,
          content,
          cover_image_url: coverUrl,
          image_public_id: coverPublicId,
          slug,
          category,
          tags: tagArray,
          excerpt: content.replace(/<[^>]+>/g, '').slice(0, 160),
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);
    } else {
      result = await supabase.from('blogs').insert({
        title,
        content,
        cover_image_url: coverUrl,
        image_public_id: coverPublicId,
        slug,
        category,
        tags: tagArray,
        excerpt: content.replace(/<[^>]+>/g, '').slice(0, 160),
      });
    }

    setSubmitting(false);

    if (result.error) {
      console.error(result.error);
      alert('Failed to submit post.');
    } else {
      alert('Post saved!');
      router.push('/blogadmin');
    }
  };

  if (!authChecked) return <p className="p-4">Checking access...</p>;
  if (!admins.includes(userName || '')) return <p className="p-4 text-red-600">Access denied</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">{editingId ? 'Edit Blog Post' : 'Write a New Blog Post'}</h1>

      {loading ? (
        <p>Loading post...</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Title"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverUpload(file);
            }}
          />
          {coverUrl && <img src={coverUrl} alt="Cover" className="mt-2 rounded" />}

          <input
            type="text"
            placeholder="Category"
            className="w-full border p-2 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="text"
            placeholder="Tags (comma-separated)"
            className="w-full border p-2 rounded"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <div className="border p-2 rounded">
            <div className="flex justify-end mb-2">
              <button
                className="text-sm text-blue-600 underline"
                onClick={handleInsertImage}
              >
                Insert Image
              </button>
            </div>
            <EditorContent editor={editor} className="prose max-w-none" />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {submitting ? 'Submitting...' : editingId ? 'Update Blog' : 'Submit Blog'}
          </button>
        </>
      )}
    </div>
  );
}
