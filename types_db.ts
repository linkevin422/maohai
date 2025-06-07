// /types_db.ts  – minimal but strict stub for Maohai forum + profiles
// Feel free to replace with the real CLI-generated file later.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [k: string]: Json }
  | Json[];

/*───────────────────────────────────────────────
  PUBLIC SCHEMA
───────────────────────────────────────────────*/
export interface Database {
  public: {
    Tables: {
      /*────────────── forum_posts ─────────────*/
      forum_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: string;
          user_id: string;
          created_at: string;          // never null in our code
          updated_at: string;
          score: number;
          reply_count: number;
          is_deleted: boolean;
          visible: boolean;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          score?: number;
          reply_count?: number;
          is_deleted?: boolean;
          visible?: boolean;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          score?: number;
          reply_count?: number;
          is_deleted?: boolean;
          visible?: boolean;
        };
      };

      /*────────────── forum_comments ──────────*/
      forum_comments: {
        Row: {
          id: string;
          post_id: string;
          parent_id: string | null;
          user_id: string;
          content: string;
          created_at: string;          // never null for us
          score: number;
        };
        Insert: {
          id?: string;
          post_id: string;
          parent_id?: string | null;
          user_id?: string;
          content: string;
          created_at?: string;
          score?: number;
        };
        Update: {
          id?: string;
          post_id?: string;
          parent_id?: string | null;
          user_id?: string;
          content?: string;
          created_at?: string;
          score?: number;
        };
      };

      /*────────────── forum_votes ─────────────*/
      forum_votes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          value: number; // 1 or –1
        };
        Insert: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          value: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          value?: number;
        };
      };

      /*────────────── profiles (username only) */
      profiles: {
        Row: {
          id: string;
          username: string | null;
        };
        Insert: never;
        Update: never;
      };
    };

    Views: {};
    Functions: {};
    Enums: {};
  };
}

/*───────────────────────────────────────────────
  Generic helpers  (keeps forum.ts neat)
───────────────────────────────────────────────*/
export type Tables<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Row'];

export type TablesInsert<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Update'];
