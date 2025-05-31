'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useText } from '@/lib/getText';

export default function AboutPage() {
  const { getText } = useText();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[64px] px-4 sm:px-8 pb-24 bg-black text-white flex flex-col items-center justify-start">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl mt-16 bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/10"
        >
          <h1 className="text-3xl font-bold mb-4 tracking-tight">
            {getText('about_title')}
          </h1>
          <p className="text-lg leading-relaxed text-white/80">
            {getText('about_description')}
          </p>

          <div className="mt-8 border-t border-white/10 pt-6 space-y-3 text-sm text-white/60">
            <p>{getText('about_line1')}</p>
            <p>{getText('about_line2')}</p>
            <p>{getText('about_line3')}</p>
          </div>
        </motion.section>
      </main>
      <Footer />
    </>
  );
}
