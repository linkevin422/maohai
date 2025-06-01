export async function uploadToCloudinary(file: File): Promise<{ url: string; public_id: string } | null> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'blog_unsigned'); // your unsigned preset
  
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dna0urqt5/image/upload', {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
      return { url: data.secure_url, public_id: data.public_id };
    } catch (err) {
      console.error('[Cloudinary Upload Error]', err);
      return null;
    }
  }
  