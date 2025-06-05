'use client';

import Link from 'next/link';
import { useText } from '@/lib/getText';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { getText } = useText();

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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
        >
          <Link
            href="/map"
            className="inline-block px-8 py-3 rounded-full bg-[#574964] hover:bg-[#9F8383] text-white text-sm sm:text-base tracking-wide transition shadow-md"
          >
            {getText('home_goto_map_button')}
          </Link>
        </motion.div>
      </motion.div>

      {/* --- Updates Section --- */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-2xl mt-24"
      >
        <h2 className="text-lg font-semibold mb-4 border-b border-[#C8AAAA] pb-2 text-[#574964]">
          {getText('home_updates_title')}
        </h2>
        <ul className="text-sm space-y-3 text-[#3A2B2B]">
          <li>{getText('home_update_1')}</li>
          <li>{getText('home_update_2')}</li>
          <li>{getText('home_update_3')}</li>
        </ul>
      </motion.section>
    </main>
  );
}
