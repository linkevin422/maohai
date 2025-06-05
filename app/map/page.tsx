// app/map/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Category } from '@/lib/useLocations';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function MapPage() {
  const [category, setCategory] = useState<Category>('restaurant');
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  if (!clientReady) return null;

  return (
    <div className="w-full" style={{ height: 'calc(100vh - 64px - 64px)' }}>
      <Map selectedCategory={category} setSelectedCategory={setCategory} />
    </div>
  );
}
