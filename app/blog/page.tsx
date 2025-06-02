'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Blog } from '@/types';
import { useText } from '@/lib/getText';
import Link from 'next/link';
import classNames from 'classnames';

const categories = ['最新', '好健康', '好旅遊', '好餐廳', '好獸醫', '好地點', '好書', '好用品'];

export default function BlogPage() {
  const supabase = createClientComponentClient();
  const { getText } = useText();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeCategory, setActiveCategory] = useState('最新');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [contentLang, setContentLang] = useState<'en' | 'zh-Hant'>('zh-Hant');

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
    let list = blogs;

    if (!search.trim()) {
      list = list.filter((b) => b.language === contentLang);
      if (activeCategory !== '最新') {
        list = list.filter((b) => b.category === activeCategory);
      }
    } else {
      const term = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(term) ||
          b.content?.toLowerCase().includes(term) ||
          (b.tags || []).some((t: string) => t.toLowerCase().includes(term))
      );
    }

    return list;
  }, [blogs, activeCategory, search, contentLang]);

  const pinned = useMemo(() => filtered.filter((b) => b.pinned), [filtered]);
  const normal = useMemo(() => filtered.filter((b) => !b.pinned), [filtered]);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 pt-8">
      {/* Language Switch */}
      <div className="mb-4 text-center">
        <button
          className={classNames(
            'px-3 py-1.5 rounded-l-full border',
            contentLang === 'zh-Hant'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-white text-gray-700 dark:bg-black dark:text-white'
          )}
          onClick={() => setContentLang('zh-Hant')}
        >
          中文
        </button>
        <button
          className={classNames(
            'px-3 py-1.5 rounded-r-full border',
            contentLang === 'en'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-white text-gray-700 dark:bg-black dark:text-white'
          )}
          onClick={() => setContentLang('en')}
        >
          EN
        </button>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto whitespace-nowrap mb-4">
        <div className="flex space-x-3">
          {categories.map((c) => (
            <button
              key={c}
              className={classNames(
                'px-4 py-2 rounded-full text-sm shrink-0 border transition',
                activeCategory === c
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'border-gray-300 dark:border-gray-700'
              )}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder={getText('search_placeholder') || '搜尋文章…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white shadow-sm"
        />
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4">{getText('pinned') || '精選文章'}</h2>
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

      {loading && <div className="text-center mt-12 text-gray-500">載入中…</div>}
    </div>
  );
}

function BlogCard({ blog, search }: { blog: Blog; search: string }) {
  const { title, slug, cover_image_url, reading_time, excerpt, category } = blog;

  const highlight = (text: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 px-1">
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
      className="border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition bg-white dark:bg-neutral-900 dark:border-neutral-800"
    >
      {cover_image_url && (
        <img src={cover_image_url} alt="" className="w-full h-40 object-cover" loading="lazy" />
      )}
      <div className="p-4 space-y-2">
        <div className="text-xs text-gray-500">{category}</div>
        <h3 className="font-bold text-base line-clamp-2">{highlight(title)}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{highlight(excerpt || '')}</p>
        {reading_time && (
          <div className="text-xs text-right text-gray-400">
            {reading_time} 分鐘閱讀
          </div>
        )}
      </div>
    </Link>
  );
}
