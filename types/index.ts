export type Blog = {
    id: string;
    title: string;
    content: string;
    slug: string;
    category: string;
    pinned: boolean;
    status?: string;
    language: 'en' | 'zh-Hant';
    tags?: string[];
    excerpt?: string;
    cover_image_url?: string;
    reading_time?: number;
    created_at?: string;
    updated_at?: string;
  };
  