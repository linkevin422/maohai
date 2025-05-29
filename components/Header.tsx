'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageProvider';

export default function Header() {
  const { lang, setLang } = useLanguage();

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-white tracking-widest"
        >
          MAOHAI
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/about" className="text-white hover:text-purple-300 transition">About</Link>
          <Link href="/map" className="text-white hover:text-purple-300 transition">Map</Link>
          <Link href="/blog" className="text-white hover:text-purple-300 transition">Blog</Link>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'en' | 'zh-Hant')}
            className="bg-black/30 text-white border border-white/20 px-2 py-1 rounded text-xs hover:border-white/40"
          >
            <option value="en">EN</option>
            <option value="zh-Hant">繁中</option>
          </select>
        </nav>
      </div>
    </header>
  );
}
    