import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const tvUrl = `${origin}/tv`;

  const browser = await puppeteer.launch({
    args: [
  ...chromium.args,
  "--no-sandbox",
  "--disable-setuid-sandbox",
],
    executablePath: await chromium.executablePath(),
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    },
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
});

    await page.goto(tvUrl, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    const screenshot = await page.screenshot({
      type: "png",
      clip: {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
      },
    });

    return new Response(screenshot as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } finally {
    await browser.close();
  }
}