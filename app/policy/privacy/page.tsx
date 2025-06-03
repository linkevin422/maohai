'use client';


import { useText } from '@/lib/getText';

export default function PrivacyPolicyPage() {
  const { getText } = useText();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-[#574964]">
      <h1 className="text-2xl font-bold mb-6">{getText('privacy_title')}</h1>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('privacy_collect_title')}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{getText('privacy_collect_1')}</li>
          <li>{getText('privacy_collect_2')}</li>
          <li>{getText('privacy_collect_3')}</li>
          <li>{getText('privacy_collect_4')}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('privacy_use_title')}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{getText('privacy_use_1')}</li>
          <li>{getText('privacy_use_2')}</li>
          <li>{getText('privacy_use_3')}</li>
          <li>{getText('privacy_use_4')}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('privacy_dont_title')}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{getText('privacy_dont_1')}</li>
          <li>{getText('privacy_dont_2')}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('privacy_storage_title')}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{getText('privacy_storage_1')}</li>
          <li>{getText('privacy_storage_2')}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">{getText('privacy_rights_title')}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{getText('privacy_rights_1')}</li>
          <li>{getText('privacy_rights_2')}</li>
        </ul>
      </section>

      <section>
        <h2 className="font-semibold mb-2">{getText('privacy_contact_title')}</h2>
        <p>{getText('privacy_contact_email')}</p>
      </section>
    </div>
  );
}
