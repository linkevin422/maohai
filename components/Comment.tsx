'use client';

import { useEffect, useState } from 'react';
import {
  CommentNode,
  voteOnComment,
  createComment,
} from '@/lib/forum';
import {
  ChevronUp,
  ChevronDown,
  CornerDownRight,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import TextareaAutosize from 'react-textarea-autosize';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { admins } from '@/lib/admins';

type Profile = { username: string | null };

interface Props {
  node: CommentNode;
  depth?: number;
  postId: string;
}

export default function Comment({ node, depth = 0, postId }: Props) {
  const supabase = createClientComponentClient();

  const [collapsed, setCollapsed] = useState(false);
  const [score, setScore] = useState(node.score);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState('');

  const [canDelete, setCanDelete] = useState(false);

  /* ───────────────── permissions ───────────────── */
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const username =
          (user.user_metadata?.username as string | undefined) ?? '';
        setCanDelete(
          user.id === node.user_id || admins.includes(username.toLowerCase()),
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ───────────────── voting ───────────────── */
  const voting = async (val: 1 | -1) => {
    const next = myVote === val ? 0 : val;
    await voteOnComment(node.id, next);
    setScore((s) => s - myVote + next);
    setMyVote(next);
  };

  /* ───────────────── reply ───────────────── */
  const submit = async () => {
    if (!text.trim()) return;
    await createComment({
      post_id: postId,
      parent_id: node.id,
      content: text.trim(),
    });
    window.location.reload();
  };

  /* ───────────────── delete (soft-delete) ───────────────── */
  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;

    const { error } = await supabase
      .from('forum_comments')
      .update({ is_deleted: true, visible: false })
      .eq('id', node.id);

    if (error) {
      alert(error.message);
      return;
    }
    window.location.reload();
  };

  const hidden = score < -7;
  const indent = depth * 16; // px

  return (
    <div className="relative" style={{ marginLeft: indent }}>
      {/* collapse bar – single elegant bar, wider hit-area */}
      <button
        className={`absolute left-0 top-0 h-full w-2 transition-colors ${
          collapsed ? 'bg-neutral-600/30' : 'bg-neutral-600/50 hover:bg-neutral-400'
        }`}
        onClick={() => setCollapsed(!collapsed)}
      />

      {/* content wrapper (no extra border now) */}
      <div className="ml-3 pl-1">
        {/* header */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>{node.profiles?.username ?? 'anonymous'}</span>
          <span>·</span>
          <span>
            {formatDistanceToNow(new Date(node.created_at), { addSuffix: true })}
          </span>
          {hidden && (
            <span className="italic ml-2">(hidden due to low score)</span>
          )}
        </div>

        {/* body */}
        {!hidden && !collapsed && (
          <p className="my-2 whitespace-pre-wrap">{node.content}</p>
        )}

        {/* actions */}
        {!collapsed && (
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            {/* vote */}
            <div className="flex items-center gap-1 select-none">
              <button
                onClick={() => voting(1)}
                className={`hover:text-amber-500 ${
                  myVote === 1 ? 'text-amber-500' : ''
                }`}
              >
                <ChevronUp size={16} />
              </button>
              <span>{score}</span>
              <button
                onClick={() => voting(-1)}
                className={`hover:text-blue-500 ${
                  myVote === -1 ? 'text-blue-500' : ''
                }`}
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* reply */}
            <button
              onClick={() => setReplying(!replying)}
              className="flex items-center gap-1 hover:text-amber-500"
            >
              <CornerDownRight size={14} />
              Reply
            </button>

            {/* delete (owner / admin) */}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 hover:text-red-500"
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        )}

        {/* reply box */}
        {replying && !collapsed && (
          <div className="mt-3">
            <TextareaAutosize
              minRows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-lg bg-neutral-800 p-2 text-sm"
              placeholder="Write your reply…"
            />
            <button
              onClick={submit}
              className="mt-2 px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-sm"
            >
              Post
            </button>
          </div>
        )}

        {/* children */}
        {!collapsed &&
          node.children.map((child) => (
            <Comment
              key={child.id}
              node={child}
              depth={depth + 1}
              postId={postId}
            />
          ))}
      </div>
    </div>
  );
}
