import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://menu-oratorio.vercel.app";

  const response = await fetch(`${baseUrl}/tv-image`, {
    cache: "no-store",
  });

  const imageBuffer = await response.arrayBuffer();

  return new NextResponse(imageBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}