import '@/app/globals.css';
import { LanguageProvider } from '@/lib/LanguageProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  metadataBase: new URL('https://maohai.tw'),
  title: {
    default: 'maohai.tw | 給有愛的毛爸媽',
    template: '%s | maohai.tw',
  },
  description: '全台最溫暖的寵物地圖與工具平台，給真正把毛孩當家人的你。',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'maohai.tw | 給有愛的毛爸媽',
    description: '全台最溫暖的寵物地圖與工具平台，給真正把毛孩當家人的你。',
    url: 'https://maohai.tw',
    siteName: 'maohai.tw',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '毛孩網站預覽圖',
      },
    ],
    locale: 'zh_Hant',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'maohai.tw | 給有愛的毛爸媽',
    description: '全台最溫暖的寵物地圖與工具平台，給真正把毛孩當家人的你。',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="h-full bg-[#FFF6EF] text-[#574964] font-sans">
      <LanguageProvider>
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 flex flex-col">
      {children}
    </main>
    <Footer />
  </div>
</LanguageProvider>
      </body>
    </html>
  );
}
