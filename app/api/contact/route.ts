import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, reason, message } = await req.json();

  if (!email || !reason || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: 'Contact Form <noreply@papaya.im>',
      to: 'peijulink@gmail.com',
      subject: `New Contact: ${reason}`,
      replyTo: email,
      text: `From: ${email}\n\nReason: ${reason}\n\nMessage:\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Resend Error:', err);
    return NextResponse.json({ error: 'Email failed' }, { status: 500 });
  }
}
