'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useText } from '@/lib/getText';
import EmailModal from './EmailModal';
import { Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const { getText } = useText();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <footer className="w-full bg-[#FFF6EF] text-[#574964] text-xs border-t border-[#C8AAAA]/50 py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-4 text-center">
          
          {/* copyright */}
          <span className="opacity-60">{getText('footer_copyright')}</span>

          {/* links */}
          <div className="flex flex-wrap justify-center gap-4 opacity-80 text-sm">
            <Link href="/policy/privacy" className="hover:underline">
              {getText('footer_privacy')}
            </Link>
            <Link href="/policy/terms" className="hover:underline">
              {getText('footer_terms')}
            </Link>
            <Link href="/reverification" className="hover:underline">
              {getText('footer_reverify')}
            </Link>
            <Link href="/contact" className="hover:underline">
              {getText('footer_contact')}
            </Link>
          </div>

          {/* social icons */}
          <div className="flex gap-5 items-center justify-center mt-2 opacity-70">
            <a
              href="https://www.instagram.com/maohai.tw"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition"
            >
              <Instagram size={20} strokeWidth={1.5} />
            </a>
            <a
              href="https://www.facebook.com/share/g/16jYwXbBhv/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition"
            >
              <Facebook size={20} strokeWidth={1.5} />
            </a>
          </div>

          {/* subscribe */}
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
