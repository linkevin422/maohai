// app/blog/[slug]/page.tsx
import { supabase } from '@/lib/supabase';
import { optimizeImage } from '@/lib/optimizeImage';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('title, content, cover_image_url, created_at')
    .eq('slug', params.slug)
    .single();

  if (error || !blog) {
    console.error(error);
    return <div>Post not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">{blog.title}</h1>
      <p className="text-gray-400 text-sm">
        {new Date(blog.created_at).toLocaleDateString()}
      </p>
      {blog.cover_image_url && (
        <img
          src={optimizeImage(blog.cover_image_url)}
          alt="Cover"
          className="w-full rounded"
        />
      )}
      <div
        className="prose max-w-none mt-4"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </div>
  );
}
