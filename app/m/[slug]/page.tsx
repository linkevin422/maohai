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
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Comment from '@/components/Comment';
import NewThreadReply from '@/components/NewThreadReply';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { admins } from '@/lib/admins';

type Profile = { username: string | null };

export default function ThreadPage() {
  const supabase = createClientComponentClient();
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [post, setPost] = useState<(Post & { profiles: Profile }) | null>(null);
  const [score, setScore] = useState(0);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);
  const [tree, setTree] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);

  // kebab menu + permission
  const [menuOpen, setMenuOpen] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  // fetch post + comments
  useEffect(() => {
    (async () => {
      try {
        const p = await fetchPostBySlug(slug);
        const flat = await fetchComments(p.id);

        setPost(p);
        setScore(p.score);
        setTree(buildCommentTree(flat));

        // check delete permission
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const username =
            (user.user_metadata?.username as string | undefined) ?? '';
          setCanDelete(
            user.id === p.user_id || admins.includes(username.toLowerCase()),
          );
        }

        setLoading(false);
      } catch {
        router.push('/m');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const voting = async (val: 1 | -1) => {
    const next = myVote === val ? 0 : val;
    await voteOnPost(post!.id, next);
    setScore((s) => s - myVote + next);
    setMyVote(next);
  };

// AFTER
const handleDelete = async () => {
  if (!confirm('Delete this post? This cannot be undone.')) return;

  const { error } = await supabase
    .from('forum_posts')
    .update({ is_deleted: true, visible: false })
    .eq('id', post!.id);

  if (error) {
    alert(error.message);
    return;
  }
  router.push('/m');
};

  // close kebab on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('#post-menu')) setMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  if (loading || !post) return null;

  return (
    <main className="w-full px-4 pt-8 mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
      {/* post header */}
      <div className="flex gap-4 mb-6">
        {/* vote column */}
        <div className="flex flex-col items-center select-none">
          <button
            className={`p-1 hover:text-amber-500 ${
              myVote === 1 ? 'text-amber-500' : ''
            }`}
            onClick={() => voting(1)}
          >
            <ChevronUp size={24} />
          </button>
          <span>{score}</span>
          <button
            className={`p-1 hover:text-blue-500 ${
              myVote === -1 ? 'text-blue-500' : ''
            }`}
            onClick={() => voting(-1)}
          >
            <ChevronDown size={24} />
          </button>
        </div>

        {/* content column */}
        <div className="flex-1 relative">
          {canDelete && (
            <div id="post-menu" className="absolute right-0 top-0">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <MoreHorizontal size={20} />
              </button>
              {menuOpen && (
                <div className="mt-1 w-32 bg-neutral-800 border border-neutral-700 rounded shadow-lg">
                  <button
                    onClick={handleDelete}
                    className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-neutral-700 rounded"
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}

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
