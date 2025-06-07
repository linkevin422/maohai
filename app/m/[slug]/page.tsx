'use client';

import { useEffect, useState } from 'react';
import {
  fetchPostBySlug,
  fetchComments,
  buildCommentTree,
  voteOnPost,
  Post,
  CommentNode,
} from '@/lib/forum';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Comment from '@/components/Comment';
import NewThreadReply from '@/components/NewThreadReply';
import { useParams, useRouter } from 'next/navigation';

type Profile = { username: string | null };

export default function ThreadPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [post, setPost] = useState<(Post & { profiles: Profile }) | null>(null);
  const [score, setScore] = useState(0);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);
  const [tree, setTree] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetchPostBySlug(slug);
        const flat = await fetchComments(p.id);
        setPost(p);
        setScore(p.score);
        setTree(buildCommentTree(flat));
        setLoading(false);
      } catch (e) {
        router.push('/m');
      }
    })();
  }, [slug, router]);

  const voting = async (val: 1 | -1) => {
    const next = myVote === val ? 0 : val;
    await voteOnPost(post!.id, next);
    setScore((s) => s - myVote + next);
    setMyVote(next);
  };

  if (loading || !post) return null;

  return (
    <main className="w-full px-4 pt-8 mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
      {/* post header */}
      <div className="flex gap-4 mb-6">
        <div className="flex flex-col items-center select-none">
          <button
            className={`p-1 hover:text-amber-500 ${myVote === 1 ? 'text-amber-500' : ''}`}
            onClick={() => voting(1)}
          >
            <ChevronUp size={24} />
          </button>
          <span>{score}</span>
          <button
            className={`p-1 hover:text-blue-500 ${myVote === -1 ? 'text-blue-500' : ''}`}
            onClick={() => voting(-1)}
          >
            <ChevronDown size={24} />
          </button>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold break-words">{post.title}</h1>
          <div className="text-xs text-neutral-400 mt-1">
            {post.profiles?.username ?? 'anonymous'} ·{' '}
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </div>
          <article className="prose prose-invert mt-4 max-w-none whitespace-pre-wrap">
            {post.content}
          </article>
        </div>
      </div>

      {/* comment count */}
      <h2 className="text-lg font-semibold mb-4">
        {post.reply_count} Comments
      </h2>

      {/* new comment box */}
      <NewThreadReply postId={post.id} />

      {/* comment tree */}
      <div className="space-y-4">
        {tree.map((node) => (
          <Comment key={node.id} node={node} depth={0} postId={post.id} />
        ))}
      </div>
    </main>
  );
}
