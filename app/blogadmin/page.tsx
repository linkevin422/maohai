'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { admins } from '@/lib/admins';

const supabase = createClientComponentClient();

type Blog = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string;
  image_public_id: string | null;
  created_at: string;
};

export default function BlogAdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      const username = data.user?.user_metadata?.username || null;
      setUserName(username);
      setAuthChecked(true);
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!admins.includes(userName || '')) {
      router.push('/');
    }
  }, [authChecked, userName, router]);

  useEffect(() => {
    if (!authChecked || !admins.includes(userName || '')) return;

    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, slug, cover_image_url, image_public_id, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setBlogs(data);
      }

      setLoading(false);
    };

    fetchBlogs();
  }, [authChecked, userName]);

  if (!authChecked || !admins.includes(userName || '')) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Blog Admin</h1>

      {loading && <p>Loading...</p>}
      {!loading && blogs.length === 0 && <p>No blogs found.</p>}

      <div className="space-y-4">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="border rounded p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{blog.title}</h2>
              <p className="text-sm text-gray-400">
                {new Date(blog.created_at).toLocaleDateString()}
              </p>
              {blog.cover_image_url && (
                <img
                  src={blog.cover_image_url}
                  alt="Cover"
                  className="w-full sm:w-48 rounded mt-2"
                />
              )}
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Link
                href={`/blog/${blog.slug}`}
                className="text-blue-600 underline text-sm text-center"
              >
                View
              </Link>
              <Link
                href={`/blogsubmit?edit=${blog.id}`}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm text-center"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(blog.id, blog.image_public_id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  async function handleDelete(id: string, public_id: string | null) {
    const confirm = window.confirm('Delete this blog post and its cover image?');
    if (!confirm) return;

    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert('Failed to delete blog.');
      return;
    }

    if (public_id) {
      const res = await fetch('/api/deleteImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id }),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error(result);
        alert('Image delete failed.');
      }
    }

    setBlogs((prev) => prev.filter((b) => b.id !== id));
  }
}
