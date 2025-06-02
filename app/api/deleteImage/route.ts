import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { public_id } = await req.json();

  if (!public_id) {
    return NextResponse.json({ error: 'Missing public_id' }, { status: 400 });
  }

  try {
    const cloudName = 'dna0urqt5';
    const apiKey = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;
    const timestamp = Math.floor(Date.now() / 1000);

    const { createHash } = await import('crypto');
    const signature = createHash('sha1')
      .update(`public_id=${public_id}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', public_id);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.result !== 'ok') {
      console.error('Cloudinary deletion failed:', data);
      console.error('Cloudinary delete failed:', data);
      return NextResponse.json({ error: data }, { status: 500 });
          }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error deleting image:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
