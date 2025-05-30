import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      address,
      google_maps_url,
      lat,
      lng,
      category,
      data,
    } = body;

    if (!name || !lat || !lng || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase.from('locations').insert({
      name,
      address,
      google_maps_url,
      lat,
      lng,
      category,
      data,
      status: 'pending',
      submitted_by: null, // optionally replace with auth user ID later
    });

    if (error) {
      console.error('[submit-location] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[submit-location] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
