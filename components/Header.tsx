'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageProvider';
import { useText } from '@/lib/getText';
import { ChevronDown, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const { lang, setLang } = useLanguage();
  const { getText } = useText();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const loginRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
    supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(event.target as Node)) {
        setLoginOpen(false);
      }
    };
    if (loginOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [loginOpen]);
  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setLoginOpen(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'zh-Hant', label: '中文' },
  ];

  const username = user?.user_metadata?.username;

  return (
<header className="w-full bg-[#FFF6EF] text-[#3A2B2B] border-b border-[#E7D8D1]">
<div className="w-full px-2 sm:px-4 py-4 flex items-center justify-between border-none">
        <Link href="/" className="flex items-baseline gap-1 group hover:opacity-90 transition">
<span className="text-3xl font-bold calligraphy">毛孩</span>
          <span className="text-[10px] font-light tracking-widest translate-y-[2px] text-[#7A5F5F] group-hover:text-[#574964] transition">
            maohai.tw
          </span>
        </Link>

        <div className="flex-1" />

        <nav className="flex items-center gap-6 text-sm font-medium relative">
          <Link href="/about" className="hover:text-[#7A5F5F] transition">{getText('header_about')}</Link>
          <Link href="/blog" className="hover:text-[#7A5F5F] transition">{getText('header_blog')}</Link>
          <Link href="/loveyou" className="hover:text-[#7A5F5F] transition">{getText('header_loveyou')}</Link>

          {!user ? (
            <button
              onClick={() => setLoginOpen(!loginOpen)}
              className="hover:text-[#7A5F5F] transition"
            >
              {getText('auth_login_button')}
            </button>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="hover:text-[#7A5F5F] transition flex items-center gap-2"
              >
                <span className="font-semibold">{username || 'User'}</span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-[#FFF6EF] border border-[#C8AAAA] rounded-md shadow-xl overflow-hidden z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[#FFDAB3] transition"
                  >
                    {getText('logout_button')}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#C8AAAA] bg-[#FFF6EF] hover:border-[#9F8383] transition"
            >
              <span>{languages.find((l) => l.code === lang)?.label}</span>
              <ChevronDown size={14} />
            </button>
            {languageOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#FFF6EF] border border-[#C8AAAA] rounded-md shadow-xl overflow-hidden z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code as 'en' | 'zh-Hant');
                      setLanguageOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[#FFDAB3] transition ${
                      l.code === lang ? 'bg-[#FFDAB3]' : ''
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

      {loginOpen && (
  <div
    ref={loginRef}
    className="absolute right-4 top-[72px] w-80 bg-[#FFF6EF] border border-[#C8AAAA] rounded-xl p-4 shadow-xl z-50 text-[#574964]"
  >
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-sm font-bold">{getText('login_title')}</h2>
      <button onClick={() => setLoginOpen(false)} className="hover:text-red-500 transition">
        <X size={18} />
      </button>
    </div>
    <form onSubmit={handleLogin} className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={getText('auth_email')}
        className="px-3 py-2 rounded bg-[#FFDAB3] border border-[#C8AAAA] text-sm"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={getText('auth_password')}
        className="px-3 py-2 rounded bg-[#FFDAB3] border border-[#C8AAAA] text-sm"
        required
      />
      <label className="flex items-center text-xs gap-2">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="accent-[#574964]"
        />
        {getText('auth_remember')}
      </label>

      {error && (
        <div className="text-red-500 text-xs">
          {error === 'Invalid login credentials'
            ? getText('auth_error_invalid_credentials')
            : error === 'User not found'
            ? getText('auth_error_user_not_found')
            : error === 'Email not confirmed'
            ? getText('auth_error_email_not_confirmed')
            : error}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2 mt-1 text-sm rounded bg-[#574964] hover:bg-[#9F8383] text-white transition"
      >
        {getText('auth_login_button')}
      </button>

      <Link
        href="/forgot"
        className="text-xs underline hover:text-[#9F8383] transition text-center"
      >
        {getText('auth_forgot')}
      </Link>

      <Link
        href="/register"
        className="text-xs underline hover:text-[#9F8383] transition text-center"
      >
        {getText('auth_register_button')}
      </Link>
    </form>
  </div>
)}    </header>
  );
}
