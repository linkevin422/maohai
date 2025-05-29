'use client';

import { useLanguage } from '@/lib/LanguageProvider';

export default function Footer() {
  const { lang, setLang } = useLanguage();

  return (
    <footer className="w-full mt-24 py-6 bg-black/60 backdrop-blur-md border-t border-white/10 text-center text-white text-xs tracking-wide">
      <div className="flex justify-center items-center gap-4">
        <span className="opacity-70">© 2025 Maohai — Pet Core of Taiwan</span>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as 'en' | 'zh-Hant')}
          className="bg-black/30 text-white border border-white/20 px-2 py-1 rounded text-xs hover:border-white/40"
        >
          <option value="en">EN</option>
          <option value="zh-Hant">繁中</option>
        </select>
      </div>
    </footer>
  );
}
