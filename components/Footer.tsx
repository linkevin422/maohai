'use client';

import { useState } from 'react';
import { useText } from '@/lib/getText';
import EmailModal from './EmailModal';

export default function Footer() {
  const { getText } = useText();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <footer className="w-full bg-black/70 backdrop-blur-md text-white text-xs border-t border-white/10 py-2">
        <div className="max-w-5xl mx-auto px-4 h-10 flex items-center justify-between">
          <span className="opacity-60">{getText('footer_copyright')}</span>
          <button
            onClick={() => setShowModal(true)}
            className="text-white text-xs underline hover:opacity-80 transition"
          >
            {getText('footer_button_subscribe')}
          </button>
        </div>
      </footer>

      {showModal && <EmailModal onClose={() => setShowModal(false)} />}
    </>
  );
}
