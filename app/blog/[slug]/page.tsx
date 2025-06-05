'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getText } from '@/lib/getText';
import { admins } from '@/lib/admins';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import ShareBar from '@/components/ShareBar';

export default function Page() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  const [blog, setBlog] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: blogData } = await supabase
        .from('blogs')
        .select(
          'title, content, cover_image_url, image_public_id, created_at, category, reading_time, username, tags, thumbnail_alt, language'
        )
        .eq('slug', slug)
        .single();

      if (blogData) {
        setBlog(blogData);

        const { data: related } = await supabase
          .from('blogs')
          .select('title, slug, cover_image_url, image_public_id, thumbnail_alt')
          .eq('category', blogData.category)
          .eq('language', blogData.language)
          .neq('slug', slug)
          .limit(3);

        setRelatedPosts(related || []);
      }
    };

    fetchData();
  }, [slug]);

  if (!blog) return <div className="p-6 text-red-600">Blog not found.</div>;

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

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-[#574964]">{title}</h1>

      {/* Share (Top) */}
      <ShareBar slug={slug} />

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

      {/* Share (Bottom) */}
      <ShareBar slug={slug} />

      {/* Related */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <hr className="mb-8 border-t border-[#C8AAAA]" />
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
