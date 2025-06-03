// app/blog/[slug]/page.tsx
import { supabase } from '@/lib/supabase';
import { admins } from '@/lib/admins';
import { getText } from '@/lib/getText';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/* ---- metadata ---- */
export async function generateMetadata(
  { params }: BlogPageProps
): Promise<Metadata> {
  // no need to read slug for the basic stub meta, but we *could*:
  // const { slug } = await params
  return {
    title: 'Blog',
    description: '',
    keywords: [],
  };
}

/* ---- page ---- */
export default async function Page({ params }: BlogPageProps) {
  const { slug } = await params;      // ✅ wait for the promise

  const { data: blog, error } = await supabase
    .from('blogs')
    .select(
      'title, content, cover_image_url, image_public_id, created_at, category, reading_time, username, tags, thumbnail_alt, language'
    )
    .eq('slug', slug)
    .single();

  if (error || !blog) {
    return <div className="p-6 text-red-600">Blog not found.</div>;
  }

  const {
    title,
    content,
    cover_image_url,
    image_public_id,
    category,
    reading_time,
    username,
    thumbnail_alt,
    language,
  } = blog;

  const isAdmin = admins.includes(username);

  const coverImage =
    image_public_id && !cover_image_url?.startsWith('http')
      ? `https://res.cloudinary.com/dyi0jzxxz/image/upload/f_auto,q_auto/${image_public_id}`
      : cover_image_url;

  const { data: relatedPosts } = await supabase
    .from('blogs')
    .select('title, slug, cover_image_url, image_public_id, thumbnail_alt')
    .eq('category', category)
    .eq('language', language)
    .neq('slug', slug)
    .limit(3);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-[#574964]">{title}</h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-[#9F8383]">
        <span className="flex items-center">
          {username}
          {isAdmin && (
  <Image
    src="/check.svg"
    alt="admin"
    title={getText('admin_badge', language)}
    width={12}
    height={12}
    className="ml-1 inline-block align-text-bottom"
  />
)}
        </span>
        <span>·</span>
        <span>{`${reading_time || 1} ${getText('reading_time_minutes', language)}`}</span>
        {category && (
          <>
            <span>·</span>
            <span>{category}</span>
          </>
        )}
      </div>

      {/* Cover */}
      {coverImage && (
        <Image
          src={coverImage}
          alt={thumbnail_alt || title}
          width={960}
          height={540}
          className="rounded-xl w-full object-cover"
        />
      )}

      {/* Content */}
      <div
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Related */}
      {relatedPosts && relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-[#574964]">
            {getText('related_posts_heading', language)}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => {
              const image =
                post.image_public_id &&
                !post.cover_image_url?.startsWith('http')
                  ? `https://res.cloudinary.com/dyi0jzxxz/image/upload/f_auto,q_auto/${post.image_public_id}`
                  : post.cover_image_url;

              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block border border-[#C8AAAA] rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {image && (
                    <Image
                      src={image}
                      alt={post.thumbnail_alt || post.title}
                      width={400}
                      height={240}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4 text-[#574964] text-sm font-semibold">
                    {post.title}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
