// app/map/metadata.ts
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '寵物地圖｜Maohai.tw',
  description: '探索全台灣最完整的寵物友善地圖，收錄餐廳、獸醫、住宿等資訊。',
  openGraph: {
    title: '寵物地圖｜Maohai.tw',
    description: '探索全台灣最完整的寵物友善地圖，收錄餐廳、獸醫、住宿等資訊。',
    url: 'https://maohai.tw/map',
    images: [
      {
        url: 'https://maohai.tw/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '毛孩地圖 Maohai.tw',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '寵物地圖｜Maohai.tw',
    description: '探索全台灣最完整的寵物友善地圖，收錄餐廳、獸醫、住宿等資訊。',
  },
};
