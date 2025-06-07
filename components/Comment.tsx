'use client';

import { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import {
  ChevronUp,
  ChevronDown,
  CornerDownRight,
  Trash2,
} from 'lucide-react';

import { voteOnComment, createComment, CommentNode } from '@/lib/forum';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { admins } from '@/lib/admins';
import { useLanguage } from '@/lib/LanguageProvider';
import { useText } from '@/lib/getText';

/*──────── types */
type Profile = { username: string | null };

interface Props {
  node: CommentNode;
  depth: number;
  postId: string;
  onAdded: () => void;        // refresh callback
  showChildren?: boolean;     // allow hiding children
}

/*──────── component */
export default function Comment({
  node,
  depth,
  postId,
  onAdded,
  showChildren = true,
}: Props) {
  const supabase = createClientComponentClient();
  const { lang } = useLanguage();
  const { getText } = useText();
  const locale = lang === 'zh-Hant' ? zhTW : enUS;

  /* ui state */
  const [collapsed, setCollapsed] = useState(false);
  const [score, setScore] = useState(node.score);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState('');
  const [canDelete, setCanDelete] = useState(false);

  /* permission */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const uname = (user.user_metadata?.username as string | undefined) ?? '';
        setCanDelete(user.id === node.user_id || admins.includes(uname.toLowerCase()));
      }
    })();
  }, []);

  /* vote */
  const voting = async (val: 1 | -1) => {
    const next = myVote === val ? 0 : val;
    await voteOnComment(node.id, next);
    setScore((s) => s - myVote + next);
    setMyVote(next);
  };

  /* reply submit */
  const submit = async () => {
    if (!text.trim()) return;
    await createComment({
      post_id: postId,
      parent_id: node.id,
      content: text.trim(),
    });
    setText('');
    setReplying(false);
    onAdded();
  };

  /* delete */
  const del = async () => {
    if (!confirm(getText('delete_comment_confirm'))) return;
    await supabase
      .from('forum_comments')
      .update({ is_deleted: true, visible: false })
      .eq('id', node.id);
    onAdded();
  };

  /* helpers */
  const hidden = score < -7;
  const indentPx = depth * 16; // 1rem per level

  /*──────── render */
  return (
    <div style={{ marginLeft: indentPx }} className="relative pl-4">
      {/* thread guide */}
      {depth > 0 && (
        <span className="absolute left-0 top-0 h-full w-px bg-zinc-200" />
      )}

      {/* comment card */}
      <div className="rounded-lg bg-white border border-zinc-200 shadow-sm p-4">
        {/* header */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{node.profiles?.username ?? getText('anonymous_user')}</span>
          <span>·</span>
          <span>
            {formatDistanceToNow(new Date(node.created_at), {
              addSuffix: true,
              locale,
            })}
          </span>
          {hidden && (
            <span className="italic ml-2 text-zinc-400">
              ({getText('hidden_low_score')})
            </span>
          )}
        </div>

        {/* body */}
        {!hidden && !collapsed && (
          <p className="my-3 whitespace-pre-wrap text-sm text-zinc-800 leading-relaxed">
            {node.content}
          </p>
        )}

        {/* action row */}
        <div className="flex items-center gap-6 text-xs text-zinc-500">
          {/* vote */}
          <div className="flex items-center gap-1 select-none">
            <button
              onClick={() => voting(1)}
              className={`hover:text-amber-500 ${myVote === 1 ? 'text-amber-500' : ''}`}
            >
              <ChevronUp size={16} />
            </button>
            <span>{score}</span>
            <button
              onClick={() => voting(-1)}
              className={`hover:text-blue-500 ${myVote === -1 ? 'text-blue-500' : ''}`}
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
            {getText('reply_btn')}
          </button>

          {/* delete */}
          {canDelete && (
            <button
              onClick={del}
              className="flex items-center gap-1 hover:text-red-500"
            >
              <Trash2 size={14} />
              {getText('delete_btn')}
            </button>
          )}

          {/* toggle replies */}
          {showChildren && node.children.length > 0 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto flex items-center gap-1 font-medium hover:text-amber-600 transition"
            >
              {collapsed ? (
                <>
                  <ChevronDown size={14} />
                  {getText('expand_replies_btn')}
                </>
              ) : (
                <>
                  <ChevronUp size={14} />
                  {getText('collapse_replies_btn')}
                </>
              )}
            </button>
          )}
        </div>

        {/* reply form */}
        {replying && (
          <div className="mt-3">
            <TextareaAutosize
              minRows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={getText('write_reply_placeholder')}
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={submit}
              className="mt-2 px-4 py-1 rounded-md bg-amber-500 text-white text-sm hover:bg-amber-600"
            >
              {getText('post_btn')}
            </button>
          </div>
        )}
      </div>

      {/* children */}
      {!collapsed && showChildren &&
        node.children.map((child) => (
          <Comment
            key={child.id}
            node={child}
            depth={depth + 1}
            postId={postId}
            onAdded={onAdded}
            showChildren={showChildren}
          />
        ))}
    </div>
  );
}
