import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ status: "RingCentral routes check", timestamp: new Date().toISOString() });
}
