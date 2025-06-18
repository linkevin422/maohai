import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// export const runtime = 'edge'; //--enable if you want edge runtime

export async function GET() {
  const baseUrl = 'https://maohai.tw';

  /* blogs → /blog/[slug] */
  const { data: blogs, error: blogErr } = await supabase
    .from('blogs')
    .select('slug')
    .eq('status', 'published');      // change if your flag differs
  if (blogErr) console.error('[sitemap] blog fetch', blogErr);

  /* locations → /m/[id] */
  const { data: locs, error: locErr } = await supabase
    .from('locations')
    .select('id')
    .eq('status', 'approved');       // change if your flag differs
  if (locErr) console.error('[sitemap] location fetch', locErr);

  const staticRoutes = [
    '',
    '/about',
    '/map',
    '/mapsubmit',
    '/blog',
    '/blogsubmit',
    '/policy/privacy',
    '/policy/terms',
    '/contact',
  ];

  const blogRoutes = (blogs ?? []).map(row => `/blog/${row.slug}`);
  const locRoutes  = (locs  ?? []).map(row => `/m/${row.id}`);

  const urls = [...staticRoutes, ...blogRoutes, ...locRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${baseUrl}${u}</loc></url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } });
}
