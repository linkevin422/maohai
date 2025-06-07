'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';

import { voteOnPost, Post } from '@/lib/forum';
import { useText } from '@/lib/getText';
import { useLanguage } from '@/lib/LanguageProvider';

type Profile = { username: string | null };
type Props = { post: Post & { profiles: Profile } };

export default function PostCard({ post }: Props) {
  const router = useRouter();
  const { getText } = useText();
  const { lang } = useLanguage();

  const [localScore, setLocalScore] = useState(post.score);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);

  const voting = async (val: 1 | -1) => {
    const nextVal: 1 | -1 | 0 = myVote === val ? 0 : val;
    await voteOnPost(post.id, nextVal);
    setLocalScore((s) => s - myVote + nextVal);
    setMyVote(nextVal);
  };

  const goto = () => router.push(`/m/${post.slug}`);
  const locale = lang === 'zh-Hant' ? zhTW : enUS;

  return (
    <div className="w-full sm:mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
      <div
        className="
          flex gap-4 rounded-xl p-4 transition hover:bg-peach-50 cursor-pointer
          bg-white border border-zinc-200 shadow-sm
        "
        onClick={goto}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && goto()}
      >
        {/* vote column */}
        <div className="flex flex-col items-center select-none text-zinc-400">
          <button
            className={`p-1 hover:text-amber-500 ${
              myVote === 1 ? 'text-amber-500' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              voting(1);
            }}
          >
            <ChevronUp size={20} />
          </button>
          <span className="text-sm">{localScore}</span>
          <button
            className={`p-1 hover:text-blue-500 ${
              myVote === -1 ? 'text-blue-500' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              voting(-1);
            }}
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* main content */}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-zinc-800 break-words">
            {post.title}
          </h3>
          <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
            <span>{post.profiles?.username ?? getText('anonymous_user')}</span>
            <span>·</span>
            <span>
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale,
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
