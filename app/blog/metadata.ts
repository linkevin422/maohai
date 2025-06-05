// app/blog/[slug]/metadata.ts
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

interface BlogPageProps {
  params: { slug: string };
}

export async function generateMetadata(
  { params }: BlogPageProps
): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug);

  const { data: blog } = await supabase
    .from('blogs')
    .select('title, cover_image_url, image_public_id, thumbnail_alt')
    .eq('slug', decodedSlug)
    .single();

  if (!blog) {
    return {
      title: 'Blog',
      description: '',
    };
  }

  const coverImage =
    blog.image_public_id && !blog.cover_image_url?.startsWith('http')
      ? `https://res.cloudinary.com/dyi0jzxxz/image/upload/f_auto,q_auto/${blog.image_public_id}`
      : blog.cover_image_url;

  return {
    title: blog.title,
    description: blog.title,
    openGraph: {
      title: blog.title,
      description: blog.title,
      images: coverImage ? [{ url: coverImage, alt: blog.thumbnail_alt || blog.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.title,
      images: coverImage ? [coverImage] : [],
    },
  };
}
