'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ReverificationPage() {
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'notfound' | 'already_verified' | 'resent' | 'error'>('idle');

  const handleResend = async () => {
    setStatus('checking');

    // 1. Check if user exists and is unverified
    const { data, error } = await supabase
    .from('unverified_users')
    .select('email_confirmed_at')
    .eq('email', email)
    .maybeSingle();
  
    if (error) {
      console.error('Fetch failed:', error.message);
      setStatus('error');
      return;
    }

    if (!data) {
      setStatus('notfound');
      return;
    }

    if (data.email_confirmed_at !== null) {
      setStatus('already_verified');
      return;
    }

    // 2. Resend confirmation
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (resendError) {
      console.error('Resend failed:', resendError.message);
      setStatus('error');
    } else {
      setStatus('resent');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold">重新驗證帳號 / Resend Email Verification</h1>
        <p className="text-sm text-gray-500">
          如果您關閉了驗證信的分頁，請在此重新寄送確認信。<br />
          If you closed the verification tab, you can resend it here.
        </p>

        <input
          type="email"
          className="w-full border rounded px-4 py-2"
          placeholder="輸入註冊的 Email / Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleResend}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          寄出驗證信 / Resend Verification
        </button>

        {status === 'resent' && <p className="text-green-500">已寄出驗證信 / Email sent successfully</p>}
        {status === 'already_verified' && <p className="text-yellow-500">此帳號已驗證 / Already verified</p>}
        {status === 'notfound' && <p className="text-red-500">找不到帳號 / Account not found</p>}
        {status === 'error' && <p className="text-red-500">發生錯誤，請稍後再試 / Something went wrong</p>}
      </div>
    </div>
  );
}
