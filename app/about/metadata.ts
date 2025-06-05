import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '關於我們｜毛孩地圖 Maohai.tw',
  description: '認識毛孩地圖，了解我們如何幫助台灣成為對寵物更友善的社會。',
  openGraph: {
    title: '關於我們｜毛孩地圖 Maohai.tw',
    description: '認識毛孩地圖，了解我們如何幫助台灣成為對寵物更友善的社會。',
    url: 'https://maohai.tw/about',
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
    title: '關於我們｜毛孩地圖 Maohai.tw',
    description: '認識毛孩地圖，了解我們如何幫助台灣成為對寵物更友善的社會。',
  },
};
