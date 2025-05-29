'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/LanguageProvider';
import { getText } from '@/lib/getText';

export default function HomePage() {
  const { lang } = useLanguage();

  return (
    <>
      <Header />
      <main className="pt-28 pb-20 min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-800 text-white flex flex-col items-center justify-center px-6">
        <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text drop-shadow">
          {getText("home_title", lang)}
        </h1>
        <p className="text-lg text-gray-300 mb-10">{getText("home_subtitle", lang)}</p>

        <div className="bg-yellow-300 text-red-600 p-6 rounded-xl shadow-xl text-xl font-bold">
          If you see this, Tailwind is fully working.
        </div>
      </main>
      <Footer />
    </>
  );
}
