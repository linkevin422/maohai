'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Category } from '@/lib/useLocations';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function MapPage() {
  const [category, setCategory] = useState<Category>('restaurant');
  const [clientReady, setClientReady] = useState(false);

  // prevent hydration mismatch
  useEffect(() => {
    setClientReady(true);
  }, []);

  if (!clientReady) return null;

  return (
    <div className="w-full" style={{ height: 'calc(100vh - 64px - 64px)' }}>
      {/* adjust the 64px heights if your header/footer are different */}
      <Map selectedCategory={category} setSelectedCategory={setCategory} />
    </div>
  );
}
