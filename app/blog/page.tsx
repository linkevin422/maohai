'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Blog } from '@/types';
import { useText } from '@/lib/getText';
import Link from 'next/link';
import classNames from 'classnames';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const categoryKeys = ['latest', 'health', 'travel', 'restaurant', 'vet', 'location', 'books', 'supplies'];

const categoryMap: Record<string, string> = {
  latest: '',
  health: '好健康',
  travel: '好旅遊',
  restaurant: '好餐廳',
  vet: '好獸醫',
  location: '好地點',
  books: '好書',
  supplies: '好用品',
};

const categoryNameToKey: Record<string, string> = {
  '好健康': 'health',
  '好旅遊': 'travel',
  '好餐廳': 'restaurant',
  '好獸醫': 'vet',
  '好地點': 'location',
  '好書': 'books',
  '好用品': 'supplies',
};

export default function BlogPage() {
  const supabase = createClientComponentClient();
  const { getText } = useText();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeCategory, setActiveCategory] = useState('latest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from('blogs').select('*').eq('status', 'published');
      if (data) setBlogs(data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = blogs.filter((b) => b.language === getText('lang_code'));

    if (activeCategory !== 'latest') {
      list = list.filter((b) => b.category === categoryMap[activeCategory]);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(term) ||
          b.content?.toLowerCase().includes(term) ||
          (b.tags || []).some((t: string) => t.toLowerCase().includes(term))
      );
    }

    return list;
  }, [blogs, activeCategory, search, getText]);

  const pinned = useMemo(() => filtered.filter((b) => b.pinned), [filtered]);
  const normal = useMemo(() => filtered.filter((b) => !b.pinned), [filtered]);

  return (
<div className="bg-[#FFF6EF] min-h-screen">
  <main className="pt-24 max-w-6xl mx-auto px-4 pb-8 text-[#574964]">
        {/* Tabs */}
        <div className="overflow-x-auto whitespace-nowrap mb-4">
          <div className="flex space-x-3">
            {categoryKeys.map((key) => (
              <button
                key={key}
                className={classNames(
                  'px-4 py-2 rounded-full text-sm shrink-0 border transition',
                  activeCategory === key
                    ? 'bg-[#574964] text-white'
                    : 'border-[#C8AAAA] text-[#574964] hover:bg-[#FFDAB3] hover:text-[#574964]'
                )}
                onClick={() => setActiveCategory(key)}
              >
                {getText(`blog_category_${key}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md mx-auto">
        <input
  type="text"
  placeholder={getText('blog_search')}
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full px-4 py-2 rounded-full border border-[#B08D8D] bg-[#C8AAAA] text-[#3A1F1F] placeholder-[#3A1F1F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9F8383]"
/>
        </div>

        {/* Pinned */}
        {pinned.length > 0 && activeCategory !== 'latest' && (
          <div className="mb-8">
            <h2 className="font-bold text-lg mb-4">{getText('blog_pinned')}</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {pinned.map((b) => (
                <BlogCard key={b.id} blog={b} search={search} />
              ))}
            </div>
          </div>
        )}

        {/* Normal */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {normal.map((b) => (
            <BlogCard key={b.id} blog={b} search={search} />
          ))}
        </div>

        {loading && <div className="text-center mt-12 text-[#9F8383]">{getText('loading')}</div>}
      </main>
      </div>
  );
}

function BlogCard({ blog, search }: { blog: Blog; search: string }) {
  const { title, slug, cover_image_url, reading_time, excerpt, category } = blog;
  const { getText } = useText();
  const categoryKey = categoryNameToKey[category] || 'latest';

  const highlight = (text: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i} className="bg-[#9F8383] text-white px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Link
      href={`/blog/${slug}`}
      className="border border-[#C8AAAA] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition bg-[#FFF6EF]"
    >
      {cover_image_url && (
        <img src={cover_image_url} alt="" className="w-full h-40 object-cover" loading="lazy" />
      )}
      <div className="p-4 space-y-2">
        <div className="text-xs text-[#9F8383]">{getText(`blog_category_${categoryKey}`)}</div>
        <h3 className="font-bold text-base line-clamp-2">{highlight(title)}</h3>
        <p className="text-sm text-[#574964] line-clamp-3">{highlight(excerpt || '')}</p>
        {reading_time && (
          <div className="text-xs text-right text-[#C8AAAA]">
            {reading_time} 分鐘閱讀
          </div>
        )}
      </div>
    </Link>
  );
}
