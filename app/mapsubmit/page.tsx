'use client';

import dynamic from 'next/dynamic';

const ClientOnlyPage = dynamic(() => import('./MapSubmitPage'), { ssr: false });

export default function Wrapper() {
  return <ClientOnlyPage />;
}
