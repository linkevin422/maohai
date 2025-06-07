'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { voteOnPost, Post } from '@/lib/forum';
import { useState } from 'react';

type Profile = { username: string | null };
type Props = {
  post: Post & { profiles: Profile };
};

export default function PostCard({ post }: Props) {
  const router = useRouter();
  const [localScore, setLocalScore] = useState<number>(post.score);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);

  const voting = async (val: 1 | -1) => {
    const nextVal: 1 | -1 | 0 = myVote === val ? 0 : val;
    await voteOnPost(post.id, nextVal);
    setLocalScore((s) => s - myVote + nextVal);
    setMyVote(nextVal);
  };

  return (
    <div
      className="w-full sm:mx-auto
        sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl
        transition-all"
    >
      <div className="flex gap-4 rounded-2xl bg-white/10 dark:bg-black/20 p-4 shadow-sm hover:bg-white/20 transition-colors">
        {/* vote column */}
        <div className="flex flex-col items-center select-none">
          <button
            className={`p-1 hover:text-amber-500 ${myVote === 1 ? 'text-amber-500' : ''}`}
            onClick={() => voting(1)}
          >
            <ChevronUp size={20} />
          </button>
          <span className="text-sm">{localScore}</span>
          <button
            className={`p-1 hover:text-blue-500 ${myVote === -1 ? 'text-blue-500' : ''}`}
            onClick={() => voting(-1)}
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* main */}
        <div className="flex-1">
          <Link
            href={`/m/${post.slug}`}
            className="text-lg font-semibold hover:underline break-words"
          >
            {post.title}
          </Link>
          <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
            <span>{post.profiles?.username ?? 'anonymous'}</span>
            <span>·</span>
            <span>
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
              })}
            </span>
            <span>·</span>
            <MessageSquare size={14} />
            <span>{post.reply_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
