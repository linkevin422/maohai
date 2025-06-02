export const extractPublicId = (url: string | null): string | null => {
    if (!url) return null;
    const match = url.match(/\/([^/]+)\.(webp|jpg|png|jpeg)$/);
    return match ? match[1] : null;
  };
  