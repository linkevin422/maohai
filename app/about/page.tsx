'use client';

import { useText } from '@/lib/getText';
import { useLanguage } from '@/lib/LanguageProvider';

export default function AboutPage() {
  const { getText } = useText();
  const { lang } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-[#574964] leading-relaxed">
      <h1 className="text-2xl font-bold mb-6">{getText('about_title')}</h1>

      {lang === 'zh-Hant' ? (
        <section className="space-y-3">
          <p>{getText('about_zh_1')}</p>
          <p>{getText('about_zh_2')}</p>
          <p>{getText('about_zh_3')}</p>
          <p>{getText('about_zh_4')}</p>
          <p>{getText('about_zh_5')}</p>
          <p>{getText('about_contact')}</p>
        </section>
      ) : (
        <section className="space-y-3">
          <p>{getText('about_en_1')}</p>
          <p>{getText('about_en_2')}</p>
          <p>{getText('about_en_3')}</p>
          <p>{getText('about_en_4')}</p>
          <p>{getText('about_en_5')}</p>
          <p>{getText('about_contact')}</p>
        </section>
      )}
    </div>
  );
}
