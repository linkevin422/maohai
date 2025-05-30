import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  const correct = password === process.env.ADMIN_PASS;
  return NextResponse.json({ success: correct });
}
