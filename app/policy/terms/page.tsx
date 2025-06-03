'use client';


import { useText } from '@/lib/getText';

export default function TermsPage() {
  const { getText } = useText();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-[#574964]">
      <h1 className="text-2xl font-bold mb-6">{getText('terms_title')}</h1>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('terms_intro_title')}</h2>
        <p>{getText('terms_intro_body')}</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('terms_conduct_title')}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{getText('terms_conduct_1')}</li>
          <li>{getText('terms_conduct_2')}</li>
          <li>{getText('terms_conduct_3')}</li>
          <li>{getText('terms_conduct_4')}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('terms_rights_title')}</h2>
        <p>{getText('terms_rights_body')}</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('terms_content_title')}</h2>
        <p>{getText('terms_content_body')}</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('terms_disclaimer_title')}</h2>
        <p>{getText('terms_disclaimer_body')}</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('terms_liability_title')}</h2>
        <p>{getText('terms_liability_body')}</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('terms_updates_title')}</h2>
        <p>{getText('terms_updates_body')}</p>
      </section>

      <section>
        <h2 className="font-semibold mb-2">{getText('terms_contact_title')}</h2>
        <p>{getText('terms_contact_email')}</p>
      </section>
    </div>
  );
}
