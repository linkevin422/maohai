'use client';

import { useState } from 'react';
import { useText } from '@/lib/getText';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const { getText } = useText();

  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email !== confirmEmail) {
      setEmailError(getText('contact_email_mismatch'));
      return;
    }

    setEmailError('');
    setStatus('sending');

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, reason, message }),
    });

    if (res.ok) {
      setStatus('sent');
      setEmail('');
      setConfirmEmail('');
      setReason('');
      setMessage('');
    } else {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FFF6EF] px-6 py-24 text-[#3A2B2B]">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl space-y-6"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          {getText('contact_title')}
        </h1>

        <div className="space-y-2">
          <label className="block text-sm font-semibold">{getText('contact_email')}</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 rounded-xl border border-[#C8AAAA] bg-white placeholder:text-[#9F8383] focus:outline-none focus:ring-2 focus:ring-[#574964]"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold">{getText('contact_email_confirm')}</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 rounded-xl border border-[#C8AAAA] bg-white placeholder:text-[#9F8383] focus:outline-none focus:ring-2 focus:ring-[#574964]"
            placeholder="you@example.com"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
          {emailError && (
            <p className="text-sm text-red-600">{emailError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold">{getText('contact_reason')}</label>
          <select
            required
            className="w-full px-4 py-2 rounded-xl border border-[#C8AAAA] bg-white text-[#3A2B2B] focus:outline-none focus:ring-2 focus:ring-[#574964]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="">{getText('contact_reason_placeholder')}</option>
            <option value="general">{getText('reason_general')}</option>
            <option value="feedback">{getText('reason_feedback')}</option>
            <option value="issue">{getText('reason_issue')}</option>
            <option value="collab">{getText('reason_collab')}</option>
            <option value="remove">{getText('reason_remove')}</option>
            <option value="other">{getText('reason_other')}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold">{getText('contact_message')}</label>
          <textarea
            required
            className="w-full h-40 px-4 py-2 rounded-xl border border-[#C8AAAA] bg-white placeholder:text-[#9F8383] focus:outline-none focus:ring-2 focus:ring-[#574964]"
            placeholder={getText('contact_message_placeholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full py-3 rounded-xl bg-[#574964] text-white font-semibold hover:bg-[#3A2B2B] transition"
        >
          {status === 'sending' ? getText('contact_sending') : getText('contact_submit')}
        </button>

        {status === 'sent' && (
          <p className="text-center text-green-600">{getText('contact_success')}</p>
        )}
        {status === 'error' && (
          <p className="text-center text-red-600">{getText('contact_error')}</p>
        )}
      </motion.form>
    </main>
  );
}
