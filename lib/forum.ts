// /lib/forum.ts
// Low-level typed helpers for Maohai Forum.
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types_db';
import { slugify } from '@/lib/slugify';          // ⬅️ NEW

const supabase = createClientComponentClient<Database>();

// ────────────────
//  Type aliases
// ────────────────
export type Post       = Tables<'forum_posts'>;
export type NewPost    = TablesInsert<'forum_posts'>;
export type PostPatch  = TablesUpdate<'forum_posts'>;

export type Comment       = Tables<'forum_comments'>;
export type NewComment    = TablesInsert<'forum_comments'>;
export type CommentPatch  = TablesUpdate<'forum_comments'>;

export type Vote       = Tables<'forum_votes'>;
export type NewVote    = TablesInsert<'forum_votes'>;
export type VotePatch  = TablesUpdate<'forum_votes'>;

// Supabase “profiles” row (username only)
type Profile = { username: string | null };

// ───────────────────────────────────────────
//  1. POSTS
// ───────────────────────────────────────────
export async function fetchPosts(opts: {
  sort?: 'new' | 'top-week' | 'top-month' | 'top-all';
  limit?: number;
  cursor?: string | null; // created_at or score cursor
}) {
  const { sort = 'new', limit = 20, cursor = null } = opts;
  let query = supabase
    .from('forum_posts')
    .select(
      `
      *,
      profiles:profiles!forum_posts_user_id_fkey(username)
    `,
    )
    .eq('visible', true)
    .eq('is_deleted', false);

  switch (sort) {
    case 'new':
      if (cursor) query = query.lt('created_at', cursor);
      query = query.order('created_at', { ascending: false });
      break;
    case 'top-week':
      query = query
        .gte('created_at', new Date(Date.now() - 7 * 864e5).toISOString())
        .order('score', { ascending: false });
      if (cursor) query = query.lt('score', cursor);
      break;
    case 'top-month':
      query = query
        .gte('created_at', new Date(Date.now() - 30 * 864e5).toISOString())
        .order('score', { ascending: false });
      if (cursor) query = query.lt('score', cursor);
      break;
    case 'top-all':
      if (cursor) query = query.lt('score', cursor);
      query = query.order('score', { ascending: false });
      break;
  }

  const { data, error } = await query.limit(limit);
  if (error) throw error;
  return data as (Post & { profiles: Profile })[];
}

export async function fetchPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(
      `
      *,
      profiles:profiles!forum_posts_user_id_fkey(username)
    `,
    )
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as Post & { profiles: Profile };
}

/** create post with automatic slug if missing */
export async function createPost(payload: NewPost) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
  
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        ...payload,
        slug: payload.slug ?? slugify(payload.title),
        user_id: user.id,
      })
      .select()          // ⬅️ fetch the inserted row
      .single();
  
    if (error) throw error;
    return data as Post;
  }

export async function updatePost(id: string, patch: PostPatch) {
  const { error } = await supabase
    .from('forum_posts')
    .update(patch)
    .eq('id', id);
  if (error) throw error;
}

export async function deletePost(id: string) {
  // soft-delete
  await updatePost(id, { is_deleted: true, visible: false });
}

// ───────────────────────────────────────────
//  2. COMMENTS
// ───────────────────────────────────────────
export async function fetchComments(postId: string) {
  const { data, error } = await supabase
    .from('forum_comments')
    .select(
      `
      *,
      profiles:profiles!forum_comments_user_id_fkey(username)
    `,
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as (Comment & { profiles: Profile })[];
}

export async function createComment(payload: NewComment) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('forum_comments')
    .insert({ ...payload, user_id: user.id })
    .select()          // ⬅️ fetch the inserted row
    .single();

  if (error) throw error;
  return data as Comment;
}

export async function updateComment(id: string, patch: CommentPatch) {
  const { error } = await supabase
    .from('forum_comments')
    .update(patch)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteComment(id: string) {
  // soft delete by replacing content
  await updateComment(id, { content: '[deleted]' });
}

// ───────────────────────────────────────────
//  3. VOTES  (posts & comments)
// ───────────────────────────────────────────
export async function voteOnPost(postId: string, value: 1 | -1 | 0) {
  await voteInternal({ post_id: postId, comment_id: null, value });
}

export async function voteOnComment(commentId: string, value: 1 | -1 | 0) {
  await voteInternal({ post_id: null, comment_id: commentId, value });
}

async function voteInternal({
  post_id,
  comment_id,
  value,
}: {
  post_id: string | null;
  comment_id: string | null;
  value: 1 | -1 | 0; // 0 = remove vote
}) {
  const uidReq = await supabase.auth.getUser();
  if (!uidReq.data.user) throw new Error('Not authenticated');

  if (value === 0) {
    const { error } = await supabase
      .from('forum_votes')
      .delete()
      .match({ user_id: uidReq.data.user.id, post_id, comment_id });
    if (error) throw error;
    return;
  }

  // UPSERT style: try insert, on conflict update
  const { error } = await supabase.from('forum_votes').upsert(
    {
      user_id: uidReq.data.user.id,
      post_id,
      comment_id,
      value,
    },
    { onConflict: comment_id ? 'user_id,comment_id' : 'user_id,post_id' },
  );
  if (error) throw error;
}

// ───────────────────────────────────────────
//  4. Utility — flatten to nested comment tree
// ───────────────────────────────────────────
export type CommentNode = (Comment & { profiles: Profile }) & {
  children: CommentNode[];
};

export function buildCommentTree(
  flat: (Comment & { profiles: Profile })[],
): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  flat.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // sort children by score DESC then date ASC
  const sortFn = (a: CommentNode, b: CommentNode) =>
    b.score - a.score || a.created_at.localeCompare(b.created_at);

  function sortTree(arr: CommentNode[]) {
    arr.sort(sortFn);
    arr.forEach((n) => sortTree(n.children));
  }

  sortTree(roots);
  return roots;
}
