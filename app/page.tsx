'use client';

import Link from 'next/link';
import { useText } from '@/lib/getText';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { getText } = useText();

  const petitionUrl =
    'https://join.gov.tw/idea/detail/9aa7743b-3f11-46d8-95a9-9f750794cf54';

  return (
    <main className="w-full min-h-[calc(100vh-64px-64px)] bg-[#FFF6EF] text-[#3A2B2B] flex flex-col items-center justify-center px-6 pt-12 pb-24">
      {/* --- Hero Section --- */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-[#574964] leading-snug mb-8">
          {getText('home_tagline')}
        </h1>

        {/* --- Petition CTA --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
          className="mb-8"
        >
          <Link
            href={petitionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFDAB3] hover:bg-[#FFC89E] text-[#574964] text-sm sm:text-base font-semibold shadow-md transition"
          >
            <span>犬貓醫療改革提案</span>
            <span className="text-[10px] sm:text-xs bg-[#574964] text-[#FFF6EF] px-2 py-0.5 rounded-full">
              立即覆議
            </span>
          </Link>
        </motion.div>

        {/* --- Action Buttons --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/map"
            className="inline-block px-8 py-3 rounded-full bg-[#574964] hover:bg-[#9F8383] text-white text-sm sm:text-base tracking-wide transition shadow-md"
          >
            {getText('home_goto_map_button')}
          </Link>

          <Link
            href="/register"
            className="inline-block px-8 py-3 rounded-full border-2 border-[#574964] text-[#574964] hover:bg-[#574964] hover:text-white text-sm sm:text-base tracking-wide transition shadow-md"
          >
            {getText('home_register_button')}
          </Link>
        </motion.div>

        {/* subtle login note */}
        <p className="mt-3 text-xs sm:text-sm text-[#574964]/80 italic">
          {getText('home_login_note')}
        </p>
      </motion.div>
    </main>
  );
}
