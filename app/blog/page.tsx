import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Blog = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string;
  excerpt: string;
  created_at: string;
};

export default async function BlogListPage() {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('id, title, slug, cover_image_url, excerpt, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return <div>Error loading blogs.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">All Blog Posts</h1>
      {blogs?.map((blog) => (
        <Link key={blog.id} href={`/blog/${blog.slug}`}>
          <div className="border rounded p-4 hover:shadow transition">
            {blog.cover_image_url && (
              <img
                src={blog.cover_image_url}
                alt="Cover"
                className="w-full h-48 object-cover rounded mb-2"
              />
            )}
            <h2 className="text-xl font-semibold">{blog.title}</h2>
            <p className="text-gray-600">{blog.excerpt}</p>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(blog.created_at).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
