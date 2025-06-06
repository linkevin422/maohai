'use client';

import { useText } from '@/lib/getText';
import { useLanguage } from '@/lib/LanguageProvider';
import { motion } from 'framer-motion';
import { Sparkles, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const { getText } = useText();
  const { lang } = useLanguage();

  return (
    <main className="w-full min-h-[calc(100vh-64px-64px)] px-6 py-16 bg-gradient-to-b from-[#FFF6EF] to-[#fefdfb] text-[#3A2B2B] flex items-start justify-center">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-2xl w-full space-y-6"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {getText('about_title')}
        </h1>

        <p className="leading-relaxed text-[17px] sm:text-lg">{getText('about_1')}</p>
        <p className="leading-relaxed text-[17px] sm:text-lg">{getText('about_2')}</p>
        <p className="leading-relaxed text-[17px] sm:text-lg">{getText('about_3')}</p>
        <p className="leading-relaxed text-[17px] sm:text-lg">{getText('about_4')}</p>
        <p className="leading-relaxed text-[17px] sm:text-lg">{getText('about_5')}</p>

        <div className="border-t border-[#C8AAAA] pt-4 flex flex-col gap-2 text-sm text-[#9F8383] mt-6">
          <p className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#C8AAAA]" />
            {getText('about_6')}
          </p>
          <Link
            href="https://www.instagram.com/linkmusicnow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <Instagram size={16} />
            instagram.com/linkmusicnow
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
