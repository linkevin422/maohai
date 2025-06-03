'use client';

import { useText } from '@/lib/getText';

export default function LoveYouPage() {
  const { getText } = useText();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF6EF] text-[#574964] px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">{getText('loveyou_title')}</h1>
      <p className="text-lg">{getText('under_construction')}</p>
    </div>
  );
}
