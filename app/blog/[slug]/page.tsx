import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Page(props: any) {
  const slug = props?.params?.slug;

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('title, content')
    .eq('slug', slug)
    .single();

  if (error || !blog) {
    return <div className="p-6 text-red-600">Blog not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{blog.title}</h1>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </div>
  );
}
