'use client';

import { useState } from 'react';
import {
  CommentNode,
  voteOnComment,
  createComment,
} from '@/lib/forum';
import {
  ChevronUp,
  ChevronDown,
  CornerDownRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import TextareaAutosize from 'react-textarea-autosize';

type Profile = { username: string | null };

interface Props {
  node: CommentNode;
  depth?: number;
  postId: string;
}

export default function Comment({ node, depth = 0, postId }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [score, setScore] = useState(node.score);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState('');

  const voting = async (val: 1 | -1) => {
    const next = myVote === val ? 0 : val;
    await voteOnComment(node.id, next);
    setScore((s) => s - myVote + next);
    setMyVote(next);
  };

  const submit = async () => {
    if (!text.trim()) return;
    await createComment({
      post_id: postId,
      parent_id: node.id,
      content: text.trim(),
    });
    window.location.reload();
  };

  const hidden = score < -7;

  return (
    <div className="relative">
      {/* collapse bar */}
      <button
        className="absolute -left-2 top-0 h-full w-1 bg-neutral-600/50 hover:bg-neutral-400 transition-colors"
        style={{ marginLeft: depth * 16 }}
        onClick={() => setCollapsed(!collapsed)}
      />

      <div
        className={`ml-4 pl-2 border-l border-neutral-600/50 ${
          collapsed ? 'opacity-50' : ''
        }`}
        style={{ marginLeft: depth * 16 }}
      >
        {/* header */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>{node.profiles?.username ?? 'anonymous'}</span>
          <span>·</span>
          <span>
            {formatDistanceToNow(new Date(node.created_at), {
              addSuffix: true,
            })}
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
            <button
              onClick={() => setReplying(!replying)}
              className="flex items-center gap-1 hover:text-amber-500"
            >
              <CornerDownRight size={14} />
              Reply
            </button>
          </div>
        )}

        {/* reply box */}
        {replying && !collapsed && (
          <div className="mt-3">
            <TextareaAutosize
              minRows={2}
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setText(e.target.value)
              }
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
