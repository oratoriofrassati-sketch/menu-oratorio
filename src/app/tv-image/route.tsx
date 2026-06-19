export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const tvUrl = `${origin}/tv`;

  const token = process.env.BROWSERLESS_TOKEN;

  if (!token) {
    return new Response("Missing BROWSERLESS_TOKEN", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const response = await fetch(
    `https://chrome.browserless.io/screenshot?token=${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: tvUrl,
        options: {
          type: "png",
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
          },
        },
        viewport: {
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          isMobile: false,
        },
        gotoOptions: {
          waitUntil: "networkidle2",
          timeout: 60000,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();

    return new Response(text, {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const image = await response.arrayBuffer();

  return new Response(image, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'inline; filename="menu-tv.png"',
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}