'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageProvider';
import { useText } from '@/lib/getText';
import { Menu, X, ChevronDown, Globe, LogIn } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const { lang, setLang } = useLanguage();
  const { getText } = useText();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const languageRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef   = useRef<HTMLDivElement | null>(null);

  // ─────────── auth tracking
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null)
    );
  }, []);

  // ─────────── click-out handling
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) setLanguageOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const languages = [
    { code: 'zh-Hant', label: '中文' },
    { code: 'en',      label: 'English' },
  ];

  const navLinks = [
    { href: '/map',      key: 'header_map' },
    { href: '/m',        key: 'header_forum' },
    { href: '/about',    key: 'header_about' },
    { href: '/blog',     key: 'header_blog' },
    { href: '/loveyou',  key: 'header_loveyou' },
  ];

  // ────────────────────────────────────────────────────────────────
  return (
    <header className="w-full bg-[#FFF6EF] text-[#3A2B2B] border-b border-[#E7D8D1] z-50">
      {/* TOP BAR  */}
      <div className="mx-auto max-w-7xl flex items-center justify-between px-5 py-3 md:py-4">

        {/* ── mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden mr-2"
          aria-label="Open Menu"
        >
          <Menu size={26} />
        </button>

        {/* ── Logo */}
        <Link href="/" className="flex items-baseline gap-1 group">
          <span className="text-3xl font-bold calligraphy">毛孩</span>
          {/* hide subtitle on phones */}
          <span className="hidden md:inline text-[10px] font-light tracking-widest translate-y-[2px] text-[#7A5F5F] group-hover:text-[#574964] transition">
            maohai.tw
          </span>
        </Link>

        {/* ── Desktop nav centre */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-7 text-sm font-medium">
          {navLinks.map(l => (
            <Link key={l.key} href={l.href} className="hover:text-[#7A5F5F] transition">
              {getText(l.key)}
            </Link>
          ))}
        </nav>

        {/* ── Right utilities */}
        <div className="flex items-center gap-3">

          {/* login / user avatar (mobile & desktop) */}
          {!user ? (
            <Link href="/register" aria-label="Login" className="md:inline-flex hidden text-sm hover:text-[#7A5F5F] transition">
              {getText('auth_login_button')}
            </Link>
          ) : (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 text-sm hover:text-[#7A5F5F] transition"
              >
                <span className="font-semibold">{user.user_metadata?.username || 'User'}</span>
                <ChevronDown size={14}/>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-[#FFF6EF] border border-[#C8AAAA] rounded shadow z-50">
                  <Link href="/mapsubmit" className="block w-full px-4 py-2 text-left text-sm hover:bg-[#FFDAB3] transition">
                    {getText('user_menu_submit_location')}
                  </Link>
                  <button
                    onClick={async () => { await supabase.auth.signOut(); setUser(null); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[#FFDAB3] transition"
                  >
                    {getText('logout_button')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Language selector – desktop only */}
          <div className="relative hidden md:block" ref={languageRef}>
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded border border-[#C8AAAA] hover:border-[#9F8383] transition"
            >
              <Globe size={16}/>
              <span>{languages.find(l => l.code === lang)?.label}</span>
              <ChevronDown size={14}/>
            </button>
            {languageOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#FFF6EF] border border-[#C8AAAA] rounded shadow z-50">
                {languages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code as 'zh-Hant' | 'en'); setLanguageOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#FFDAB3] transition ${lang === l.code ? 'bg-[#FFDAB3]' : ''}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* mobile login icon (shows even if desktop link hidden) */}
          {!user && (
            <Link href="/register" className="md:hidden" aria-label="Login">
              <LogIn size={24}/>
            </Link>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────── MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-[#FFF6EF] overflow-y-auto">
          {/* top row */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7D8D1]">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-baseline gap-1">
              <span className="text-3xl font-bold calligraphy">毛孩</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} aria-label="Close Menu">
              <X size={28}/>
            </button>
          </div>

          {/* nav links */}
          <nav className="flex flex-col px-6 py-8 gap-6 text-lg font-medium">
            {navLinks.map(l => (
              <Link key={l.key} href={l.href} onClick={() => setMobileOpen(false)} className="hover:text-[#7A5F5F] transition">
                {getText(l.key)}
              </Link>
            ))}

            {/* submit + logout OR login */}
            {user ? (
              <>
                <Link href="/mapsubmit" onClick={() => setMobileOpen(false)} className="hover:text-[#7A5F5F] transition">
                  {getText('user_menu_submit_location')}
                </Link>
                <button
                  onClick={async () => { await supabase.auth.signOut(); setUser(null); setMobileOpen(false); }}
                  className="text-left hover:text-[#7A5F5F] transition"
                >
                  {getText('logout_button')}
                </button>
              </>
            ) : (
              <Link href="/register" onClick={() => setMobileOpen(false)} className="hover:text-[#7A5F5F] transition">
                {getText('auth_login_button')}
              </Link>
            )}

            {/* language selector in drawer */}
            <div className="pt-6 border-t border-[#E7D8D1]">
            <span className="block mb-3 text-sm text-[#7A5F5F] opacity-80">
  🌐 {lang === 'zh-Hant' ? 'Select Language' : '語言'}
</span>             {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code as 'zh-Hant' | 'en'); }}
                  className={`w-full text-left py-2 text-base hover:text-[#7A5F5F] transition ${lang === l.code ? 'font-semibold' : ''}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
