'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useText } from '@/lib/getText';
import EmailModal from './EmailModal';

export default function Footer() {
  const { getText } = useText();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <footer className="w-full bg-[#FFF6EF] text-[#574964] text-xs border-t border-[#C8AAAA]/50 py-4">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <span className="opacity-70">{getText('footer_copyright')}</span>
          <div className="flex flex-wrap items-center gap-4 opacity-70">
            <Link href="/reverification" className="hover:underline">
              {getText('footer_reverify')}
            </Link>
            <Link href="/policy/privacy" className="hover:underline">
              {getText('footer_privacy')}
            </Link>
            <Link href="/policy/terms" className="hover:underline">
              {getText('footer_terms')}
            </Link>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-1.5 rounded-full text-xs bg-[#C8AAAA] text-white hover:bg-[#b08d8d] transition"
          >
            {getText('footer_button_subscribe')}
          </button>
        </div>
      </footer>

      {showModal && <EmailModal onClose={() => setShowModal(false)} />}
    </>
  );
}
