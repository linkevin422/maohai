'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageProvider';
import { useText } from '@/lib/getText';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { lang, setLang } = useLanguage();
  const { getText } = useText();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'zh-Hant', label: '中文' },
  ];

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-black/70 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-widest text-white hover:opacity-90 transition">
          MAOHAI
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/about" className="text-white hover:text-purple-300 transition">{getText('header_about')}</Link>
          <Link href="/map" className="text-white hover:text-purple-300 transition">{getText('header_map')}</Link>
          <Link href="/blog" className="text-white hover:text-purple-300 transition">{getText('header_blog')}</Link>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-white border border-white/20 bg-white/5 hover:border-white/40 transition"
            >
              <span>{languages.find((l) => l.code === lang)?.label}</span>
              <ChevronDown size={14} />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-32 bg-black border border-white/10 rounded-md shadow-xl overflow-hidden z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code as 'en' | 'zh-Hant');
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition ${
                      l.code === lang ? 'bg-white/10' : ''
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
