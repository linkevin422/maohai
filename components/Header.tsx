'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageProvider';
import { useText } from '@/lib/getText';
import { ChevronDown, Menu, X, Globe } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const loginRef = useRef<HTMLDivElement | null>(null);
  const languageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null)
    );
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);
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

  const username = user?.user_metadata?.username;
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'zh-Hant', label: '中文' },
  ];

  const navLinks = [
    { href: '/map', key: 'header_map' },
    { href: '/m', key: 'header_forum' },
    { href: '/about', key: 'header_about' },
    { href: '/blog', key: 'header_blog' },
    { href: '/loveyou', key: 'header_loveyou' },
  ];

  return (
    <header className="w-full bg-[#FFF6EF] text-[#3A2B2B] border-b border-[#E7D8D1] z-50">
<div className="w-full px-4 py-4 relative flex items-center justify-between">
  {/* Left: Logo */}
  <Link href="/" className="flex items-baseline gap-1 group hover:opacity-90 transition">
    <span className="text-3xl font-bold calligraphy">毛孩</span>
    <span className="text-[10px] font-light tracking-widest translate-y-[2px] text-[#7A5F5F] group-hover:text-[#574964] transition">
      maohai.tw
    </span>
  </Link>

  {/* Mobile Menu Button */}
  <div className="sm:hidden">
    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
      {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  </div>

  {/* Center: Nav links */}
  <nav className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-5 text-sm font-medium">
    {navLinks.map((link) => (
      <Link key={link.href} href={link.href} className="hover:text-[#7A5F5F] transition">
        {getText(link.key)}
      </Link>
    ))}
  </nav>

  {/* Right: Login + Language */}
  <div className="hidden sm:flex items-center gap-4">
    {!user ? (
      <button onClick={() => setLoginOpen(!loginOpen)} className="hover:text-[#7A5F5F] transition">
        {getText('auth_login_button')}
      </button>
    ) : (
      <div className="relative" ref={userMenuRef}>
        <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="hover:text-[#7A5F5F] transition flex items-center gap-2">
          <span className="font-semibold">{username || 'User'}</span>
          <ChevronDown size={14} />
        </button>
        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-[#FFF6EF] border border-[#C8AAAA] rounded-md shadow-xl overflow-hidden z-50">
            <Link href="/mapsubmit" className="block w-full text-left px-4 py-2 text-sm hover:bg-[#FFDAB3] transition">
              {getText('user_menu_submit_location')}
            </Link>
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

    <div className="relative" ref={languageRef}>
      <button
        onClick={() => setLanguageOpen(!languageOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#C8AAAA] bg-[#FFF6EF] hover:border-[#9F8383] transition"
      >
        <Globe size={16} />
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
  </div>
</div>

      {mobileMenuOpen && (
        <div className="sm:hidden flex flex-col gap-2 px-4 pb-4 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#7A5F5F] transition">
              {getText(link.key)}
            </Link>
          ))}

          {!user ? (
            <button onClick={() => setLoginOpen(true)} className="hover:text-[#7A5F5F] transition">
              {getText('auth_login_button')}
            </button>
          ) : (
            <>
              <Link href="/mapsubmit" className="hover:text-[#7A5F5F] transition">
                {getText('user_menu_submit_location')}
              </Link>
              <button onClick={handleLogout} className="hover:text-[#7A5F5F] transition">
                {getText('logout_button')}
              </button>
            </>
          )}
        </div>
      )}

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
              disabled={loginLoading}
              className="w-full py-2 mt-1 text-sm rounded bg-[#574964] hover:bg-[#9F8383] text-white transition flex justify-center items-center"
            >
              {loginLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                getText('auth_login_button')
              )}
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
      )}
    </header>
  );
}
