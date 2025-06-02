export const extractImageIds = (html: string): string[] => {
    const matches = Array.from(html.matchAll(/src="[^"]*\/([^"/]+)\.(webp|jpg|png|jpeg)"/g));
    return matches.map((m) => m[1]); // returns Cloudinary public_ids
  };
  