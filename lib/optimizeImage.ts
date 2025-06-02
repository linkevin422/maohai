export function optimizeImage(url: string | null): string {
    if (!url) return '';
    return url.includes('/upload/')
      ? url.replace('/upload/', '/upload/q_auto,f_auto/')
      : url;
  }
  