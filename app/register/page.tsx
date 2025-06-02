'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useText } from '@/lib/getText';


const bannedWords = ['nigger', 'fag', 'faggot', 'fuck', 'shit'];

export default function RegisterPage() {
  const { getText } = useText();
  const supabase = createClientComponentClient();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  const containsBannedWord = (str: string) => {
    return bannedWords.some((word) => str.toLowerCase().includes(word));
  };

  if (!mounted) return <div />; // ✅ This is now safe

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
  
    // ✅ Check email from profiles
    const { data: emailMatch, error: emailCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
  
    if (emailCheckError) {
      setError('Email check failed.');
      setLoading(false);
      return;
    }
  
    if (emailMatch) {
      setError(getText('auth_error_existing_email'));
      setLoading(false);
      return;
    }
  
    // ✅ Check username from profiles
    const { data: usernameMatch, error: usernameCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
  
    if (usernameCheckError) {
      setError('Username check failed.');
      setLoading(false);
      return;
    }
  
    if (usernameMatch) {
      setError(getText('auth_error_existing_username'));
      setLoading(false);
      return;
    }
  
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
  
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
  
    setLoading(false);
  };
        
  const handleResend = async () => {
    setResendError('');
    setResendSuccess(false);
    setResending(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      setResendError(error.message);
    } else {
      setResendSuccess(true);
    }

    setResending(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FFDAB3]">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md rounded-2xl p-8 shadow-xl space-y-5 bg-[#C8AAAA] border border-[#9F8383]"
      >
        <h1 className="text-center text-2xl font-bold text-[#574964] tracking-wide">
          {getText('register_title')}
        </h1>

        <div className="space-y-1 text-center">
          <label className="block text-sm font-semibold text-[#574964]">
            {getText('auth_username')}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full text-center px-4 py-2 rounded-md border text-white placeholder-white/70 bg-[#9F8383] border-[#574964] outline-none font-mono tracking-wide text-lg"
            placeholder="Your unique ID"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#574964]">
            {getText('auth_email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md border text-white placeholder-white/70 bg-[#9F8383] border-[#574964] outline-none"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#574964]">
            {getText('auth_password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md border text-white placeholder-white/70 bg-[#9F8383] border-[#574964] outline-none"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#574964]">
            {getText('auth_confirm_password')}
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-2 rounded-md border text-white placeholder-white/70 bg-[#9F8383] border-[#574964] outline-none"
            required
          />
        </div>

        <div className="flex items-start gap-2 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="mt-1 accent-[#574964]"
          />
          <label htmlFor="terms" className="text-sm text-white">
            {getText('auth_accept_terms')}
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-100 text-center pt-1">{error}</p>
        )}

        {success ? (
          <>
            <p className="text-sm text-white text-center pt-1">
              {getText('auth_success_email_sent')}
            </p>
            <p className="text-xs text-white/80 text-center">
              {getText('auth_check_spam')} <br />
              {getText('auth_resend_prompt')}
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2 rounded-md text-sm font-semibold text-white mt-4 bg-[#574964] hover:bg-[#473757] transition disabled:opacity-60"
            >
              {resending
                ? getText('auth_resending')
                : getText('auth_resend_button')}
            </button>
            {resendSuccess && (
              <p className="text-green-100 text-sm text-center pt-1">
                {getText('auth_resend_success')}
              </p>
            )}
            {resendError && (
              <p className="text-red-100 text-sm text-center pt-1">
                {resendError}
              </p>
            )}
          </>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md text-sm font-semibold text-white mt-2 bg-[#574964] hover:bg-[#473757] transition disabled:opacity-60"
          >
            {getText('auth_register_button')}
          </button>
        )}
      </form>
    </main>
  );
}
