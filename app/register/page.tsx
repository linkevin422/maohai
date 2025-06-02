'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useText } from '@/lib/getText';

const bannedWords = ['nigger', 'fag', 'faggot', 'fuck', 'shit'];

export default function RegisterPage() {
  const { getText } = useText();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const containsBannedWord = (str: string) => {
    return bannedWords.some((word) => str.toLowerCase().includes(word));
  };

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

    if (containsBannedWord(username)) {
      setError(getText('auth_error_banned'));
      return;
    }

    setLoading(true);

    const { data: existing, error: lookupError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      setError(getText('auth_error_existing_email'));
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
    <>
      <main className="min-h-screen bg-black text-white px-4 py-20 flex items-center justify-center">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-sm bg-white/5 p-6 rounded-xl border border-white/10"
        >
          <h1 className="text-xl font-bold mb-4">{getText('register_title')}</h1>

          <label className="block text-sm mb-1">{getText('auth_username')}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded bg-white/10 border border-white/10 text-white"
            required
          />

          <label className="block text-sm mb-1">{getText('auth_email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded bg-white/10 border border-white/10 text-white"
            required
          />

          <label className="block text-sm mb-1">{getText('auth_password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded bg-white/10 border border-white/10 text-white"
            required
          />

          <label className="block text-sm mb-1">{getText('auth_confirm_password')}</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded bg-white/10 border border-white/10 text-white"
            required
          />

          {success ? (
            <>
              <p className="text-green-400 text-sm text-center mb-2">
                {getText('auth_success_email_sent')}
              </p>
              <p className="text-sm text-center text-white/80">
                {getText('auth_check_spam')} <br />
                {getText('auth_resend_prompt')}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full py-2 rounded bg-purple-700 hover:bg-purple-800 transition disabled:opacity-50"
                >
                  {resending ? getText('auth_resending') : getText('auth_resend_button')}
                </button>
                {resendSuccess && (
                  <p className="text-green-400 text-sm text-center">
                    {getText('auth_resend_success')}
                  </p>
                )}
                {resendError && (
                  <p className="text-red-400 text-sm text-center">{resendError}</p>
                )}
              </div>
            </>
          ) : (
            <>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
              >
                {getText('auth_register_button')}
              </button>
            </>
          )}
        </form>
      </main>
    </>
  );
}
