// /lib/slugify.ts
import { customAlphabet } from 'nanoid';

const nano = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

/** turns a title into `my-awesome-post-abc123` */
export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')        // replace junk with hyphens
      .replace(/^-+|-+$/g, '')           // trim hyphens
      .slice(0, 64)                      // keep it short-ish
      + '-' +
      nano()
  );
}
