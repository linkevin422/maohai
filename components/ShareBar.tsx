'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Share } from 'lucide-react'; // uses Lucide share icon

interface ShareBarProps {
  slug: string;
}

export default function ShareBar({ slug }: ShareBarProps) {
  const url = `https://maohai.tw/blog/${slug}`;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  return (
    <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
      {/* Share Icon Label */}
      <div className="text-[#9F8383]">
        <Share size={18} />
      </div>

      {/* LINE */}
      <a
        href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="LINE"
        className="flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 rounded-md"
      >
        <Image src="/line.png" alt="LINE" width={20} height={20} />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Facebook"
        className="flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-md"
      >
        <Image src="/facebook.png" alt="Facebook" width={20} height={20} />
      </a>

      {/* Threads */}
      <a
        href="https://www.threads.net/"
        target="_blank"
        rel="noopener noreferrer"
        title="Threads"
        className="flex items-center justify-center w-8 h-8 bg-pink-100 hover:bg-pink-200 rounded-md"
      >
        <Image src="/threads.png" alt="Threads" width={20} height={20} />
      </a>

      {/* Copy */}
      <button
        onClick={copyToClipboard}
        title="複製連結"
        className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-md relative"
      >
        <Image src="/copy.png" alt="Copy" width={20} height={20} />
        {copied && (
          <span className="absolute -right-2 -bottom-5 text-xs text-green-600">
            已複製
          </span>
        )}
      </button>
    </div>
  );
}
