import '@/app/globals.css';
import { LanguageProvider } from '@/lib/LanguageProvider';

export const metadata = {
  title: "Maohai",
  description: "The pet core of Taiwan",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white min-h-screen font-sans">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
