'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useText } from '@/lib/getText';

export default function EmailModal({ onClose }: { onClose: () => void }) {
  const { getText } = useText();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'duplicate'>('idle');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return setStatus('error');

    const { error } = await supabase.from('emails').insert({ email });
    if (error) {
      if (error.code === '23505') setStatus('duplicate');
      else setStatus('error');
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 text-sm hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-black mb-3">{getText('footer_button_subscribe')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={mounted ? getText('footer_email_placeholder') : ''}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            required
            className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
          >
            {getText('footer_button_subscribe')}
          </button>
        </form>

        {status === 'success' && <p className="text-green-600 text-xs mt-2">{getText('footer_success')}</p>}
        {status === 'error' && <p className="text-red-600 text-xs mt-2">{getText('footer_error')}</p>}
        {status === 'duplicate' && <p className="text-yellow-600 text-xs mt-2">{getText('footer_duplicate')}</p>}
      </div>
    </div>
  );
}
