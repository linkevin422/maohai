'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useText } from '@/lib/getText';

const bannedWords = ['nigger', 'fag', 'faggot', 'fuck', 'shit'];

export default function RegisterPage() {
  const { getText } = useText();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  // ────────────────── redirect if logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.replace('/');
      } else {
        setMounted(true);
      }
    };
    checkUser();
  }, [router, supabase]);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const containsBannedWord = (s: string) =>
    bannedWords.some((w) => s.toLowerCase().includes(w));

  if (!mounted) return <div />;

  // ────────────────── register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !password || !username) {
      setError(getText('auth_error_required'));
      return;
    }
    if (password !== confirm) {
      setError(getText('auth_error_mismatch'));
      return;
    }
    if (!agreed) {
      setError(getText('auth_error_terms_required'));
      return;
    }
    if (containsBannedWord(username)) {
      setError(getText('auth_error_banned'));
      return;
    }

    setLoading(true);

    const { data: emailMatch } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (emailMatch) {
      setError(getText('auth_error_existing_email'));
      setLoading(false);
      return;
    }

    const { data: userMatch } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (userMatch) {
      setError(getText('auth_error_existing_username'));
      setLoading(false);
      return;
    }

    const { error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (signErr) setError(signErr.message);
    else setSuccess(true);

    setLoading(false);
  };

  // ────────────────── resend
  const handleResend = async () => {
    setResendError('');
    setResendSuccess(false);
    setResending(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) setResendError(error.message);
    else setResendSuccess(true);

    setResending(false);
  };

  // ────────────────── UI
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FFF6EF]">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-lg rounded-2xl p-10 shadow-lg space-y-6 bg-white border border-[#E7D8D1]"
      >
        <h1 className="text-center text-3xl font-bold text-[#574964] tracking-wide">
          {getText('register_title')}
        </h1>

        {/* USERNAME */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-[#574964]">
            {getText('auth_username')}
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-[#C8AAAA] bg-[#FFF6EF] text-[#3A2B2B] placeholder-[#9F8383]/60 outline-none focus:ring-2 focus:ring-[#FFDAB3]"
            required
          />
        </div>

        {/* EMAIL */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-[#574964]">
            {getText('auth_email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2 rounded-md border border-[#C8AAAA] bg-[#FFF6EF] text-[#3A2B2B] placeholder-[#9F8383]/60 outline-none focus:ring-2 focus:ring-[#FFDAB3]"
            required
          />
        </div>

        {/* PASSWORD */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-[#574964]">
            {getText('auth_password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-[#C8AAAA] bg-[#FFF6EF] text-[#3A2B2B] placeholder-[#9F8383]/60 outline-none focus:ring-2 focus:ring-[#FFDAB3]"
            required
          />
        </div>

        {/* CONFIRM */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-[#574964]">
            {getText('auth_confirm_password')}
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-[#C8AAAA] bg-[#FFF6EF] text-[#3A2B2B] placeholder-[#9F8383]/60 outline-none focus:ring-2 focus:ring-[#FFDAB3]"
            required
          />
        </div>

        {/* TERMS */}
        <label className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="mt-1 accent-[#574964]"
          />
          <span className="text-sm text-[#3A2B2B]">
            {getText('auth_accept_terms')}
          </span>
        </label>

        {/* ERR / SUCCESS */}
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        {success && (
          <>
            <p className="text-sm text-green-700 text-center">
              {getText('auth_success_email_sent')}
            </p>
            <p className="text-xs text-[#574964]/80 text-center">
              {getText('auth_check_spam')} <br />
              {getText('auth_resend_prompt')}
            </p>
          </>
        )}

        {/* BUTTONS */}
        {!success ? (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md text-sm font-semibold text-white bg-[#574964] hover:bg-[#473757] transition disabled:opacity-60 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              getText('auth_register_button')
            )}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2 rounded-md text-sm font-semibold text-white bg-[#574964] hover:bg-[#473757] transition disabled:opacity-60 flex justify-center items-center"
            >
              {resending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                getText('auth_resend_button')
              )}
            </button>

            {resendSuccess && (
              <p className="text-green-700 text-sm text-center pt-1">
                {getText('auth_resend_success')}
              </p>
            )}
            {resendError && (
              <p className="text-red-600 text-sm text-center pt-1">
                {resendError}
              </p>
            )}
          </>
        )}

        {/* POLICY LINKS */}
        <div className="pt-6 text-center text-xs text-[#574964]/80 space-x-4">
          <Link href="/policy/privacy" className="hover:underline">
            {getText('footer_privacy')}
          </Link>
          <span>•</span>
          <Link href="/policy/terms" className="hover:underline">
            {getText('footer_terms')}
          </Link>
        </div>
      </form>
    </main>
  );
}
