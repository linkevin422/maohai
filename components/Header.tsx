'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageProvider';
import { useText } from '@/lib/getText';
import { GlobeIcon, ChevronDownIcon } from 'lucide-react';
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
    <header className="w-full fixed top-0 left-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="max-w-6xl mxs-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-white tracking-widest"
        >
          MAOHAI
        </Link>

        <nav className="flex items-center gap-6 text-sm relative">
          <Link href="/about" className="text-white hover:text-purple-300 transition">
            {getText('header_about')}
          </Link>
          <Link href="/map" className="text-white hover:text-purple-300 transition">
            {getText('header_map')}
          </Link>
          <Link href="/blog" className="text-white hover:text-purple-300 transition">
            {getText('header_blog')}
          </Link>

<div className="relative">
  <button
    onClick={() => setOpen(!open)}
    className="flex items-center gap-2 px-3 py-1 border border-white/20 rounded text-white text-xs bg-black/30 hover:border-white/40"
  >
    {languages.find((l) => l.code === lang)?.label}
  </button>
  {open && (
    <div className="absolute right-0 mt-2 w-32 bg-black border border-white/10 rounded shadow-md z-10">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => {
            setLang(l.code as 'en' | 'zh-Hant');
            setOpen(false);
          }}
          className={`w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 ${
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