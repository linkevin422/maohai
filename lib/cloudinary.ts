export async function uploadToCloudinary(file: File): Promise<{ url: string; public_id: string } | null> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'blog_unsigned'); // your unsigned preset

  try {
    const res = await fetch('https://api.cloudinary.com/v1_1/dna0urqt5/image/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Cloudinary Upload Error] HTTP', res.status, errorText);
      return null;
    }

    const data = await res.json();

    if (!data.secure_url || !data.public_id) {
      console.error('[Cloudinary Upload Error] Missing fields in response:', data);
      return null;
    }

    return {
      url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (err) {
    console.error('[Cloudinary Upload Error]', err);
    return null;
  }
}

export async function deleteFromCloudinary(public_id: string): Promise<boolean> {
  try {
    const res = await fetch('/api/deleteImage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Cloudinary Delete Error]', res.status, errText);
      return false;
    }

    const result = await res.json();
    if (!result.success) {
      console.error('[Cloudinary Delete Failed]', result);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Cloudinary Delete Exception]', err);
    return false;
  }
}
