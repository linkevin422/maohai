'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { optimizeImage } from '@/lib/optimizeImage';
import { useText } from '@/lib/getText';
import { User } from '@supabase/supabase-js';
import Head from 'next/head';


type Memorial = {
  id: string;
  user_id: string;
  pet_name: string;
  owner_name: string;
  photo_url: string;
  birth_year: number | null;
  death_year: number;
  note: string | null;
  submitted_at: string;
};

export default function LoveYouGallery() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { getText } = useText();

  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [filtered, setFiltered] = useState<Memorial[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Memorial | null>(null);
  const [user, setUser] = useState<User | null>(null);

  /* ----------------------------- auth state ------------------------------ */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  /* --------------------------- initial fetch ----------------------------- */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('memorials')
        .select('*')
        .eq('visible', true);

      if (error) {
        alert(error.message);
        return;
      }

      const shuffled = (data ?? []).sort(() => Math.random() - 0.5);
      setMemorials(shuffled);
      setFiltered(shuffled);
    })();
  }, []);

  /* -------------------------- search filter ----------------------------- */
  useEffect(() => {
    if (!query) {
      setFiltered(memorials);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(memorials.filter((m) => m.pet_name.toLowerCase().includes(q)));
  }, [query, memorials]);

  /* ------------------------- delete handler ----------------------------- */
  const handleDelete = async (id: string) => {
    if (!confirm(getText('delete_confirm'))) return;

    const currentUserId = user?.id ?? '';

    const { error } = await supabase
      .from('memorials')
      .update({ visible: false })
      .eq('id', id)
      .eq('user_id', currentUserId)
      .select();

    if (error) {
      alert(getText('submit_error') + error.message);
      return;
    }

    setMemorials((prev) => prev.filter((m) => m.id !== id));
    setFiltered((prev) => prev.filter((m) => m.id !== id));
    setSelected(null);
  };

  /* ------------------------------ UI ------------------------------------ */
  return (
    <>
      <Head>
        <title>永遠愛你們 LoveYouAlways | Maohai.tw</title>
        <meta name="description" content="為離開的毛孩留下紀念，讓我們一起記得他們的名字與故事。" />
        <meta property="og:title" content="永遠愛你們 LoveYouAlways | Maohai.tw" />
        <meta property="og:description" content="為離開的毛孩留下紀念，讓我們一起記得他們的名字與故事。" />
        <meta property="og:image" content="https://maohai.tw/og-image.jpg" />
        <meta property="og:url" content="https://maohai.tw/loveyou" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="永遠愛你們 LoveYouAlways | Maohai.tw" />
        <meta name="twitter:description" content="為離開的毛孩留下紀念，讓我們一起記得他們的名字與故事。" />
        <meta name="twitter:image" content="https://maohai.tw/og-image.jpg" />
      </Head>
  
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-semibold text-center text-[#574964] mb-6 tracking-wide">
        {getText('memorial_title')}
      </h1>

      <p className="text-center text-[#9F8383] mb-8">
        {getText('memorial_subtitle')}
      </p>

      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder={getText('search_placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md border border-[#C8AAAA] bg-white text-[#574964] px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D8A7B1]"
        />
      </div>

      <div className="flex justify-center mb-10">
        <Link
          href="/loveyou/submit"
          className="inline-block text-[#9F8383] text-sm hover:text-[#B89494] underline underline-offset-4 transition"
        >
          {getText('remember_button')}
        </Link>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className="w-[200px] h-[200px] overflow-hidden rounded-xl border border-[#E4D5D5] bg-white shadow hover:shadow-md transition-all duration-300"
            >
              <div className="relative w-full h-full">
                <Image
                  src={optimizeImage(m.photo_url)}
                  alt={m.pet_name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {m.pet_name}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ----------------------- details modal ------------------------ */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        className="fixed z-50 inset-0"
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          {selected && (
            <Dialog.Panel className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border">
                <Image
                  src={optimizeImage(selected.photo_url)}
                  alt={selected.pet_name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="text-center text-[#574964]">
                <h2 className="text-2xl font-bold">{selected.pet_name}</h2>
                <p className="text-sm text-[#9F8383] mt-1">
                  {selected.birth_year
                    ? `${selected.birth_year} – ${selected.death_year}`
                    : `${getText('passed_in')} ${selected.death_year}`}
                </p>
                {selected.note && (
                  <p className="text-base mt-4 text-[#4E4E4E] whitespace-pre-wrap">
                    {selected.note}
                  </p>
                )}
                <p className="text-sm text-[#C8AAAA] mt-6 leading-tight">
                  {getText('owner_label')}：{selected.owner_name}
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setSelected(null)}
                  className="mt-2 px-5 py-2 rounded-md bg-[#C8AAAA] text-white hover:bg-[#B89494] transition"
                >
                  {getText('close_button')}
                </button>
              </div>

              {selected.user_id === user?.id && (
                <div className="flex gap-3 justify-center mt-4">
                  <button
                    onClick={() =>
                      router.push(`/loveyou/submit?edit=${selected.id}`)
                    }
                    className="px-4 py-2 rounded bg-[#C8AAAA] text-white hover:bg-[#B89494] transition"
                  >
                    {getText('edit_button')}
                  </button>
                </div>
              )}
            </Dialog.Panel>
          )}
        </div>
        </Dialog>
      </div>
    </>
  );
}
