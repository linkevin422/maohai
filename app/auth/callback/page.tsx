'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const type = searchParams.get('type');

      if (!token || !email || type !== 'signup') {
        setStatus('error');
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (error) {
        console.error('Verification failed:', error.message);
        setStatus('error');
      } else {
        setStatus('success');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };

    verifyEmail();
  }, [searchParams, supabase, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {status === 'loading' && (
        <>
          <p className="text-xl font-bold">驗證中... Please wait...</p>
          <p className="mt-2 text-gray-400">正在驗證您的帳號<br />Verifying your account</p>
        </>
      )}
      {status === 'success' && (
        <>
          <p className="text-xl font-bold text-green-500">帳號驗證成功！</p>
          <p className="mt-2 text-gray-400">Account verified. Redirecting...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <p className="text-xl font-bold text-red-500">驗證失敗</p>
          <p className="mt-2 text-gray-400">連結無效或已過期<br />Invalid or expired link</p>
        </>
      )}
    </div>
  );
}
