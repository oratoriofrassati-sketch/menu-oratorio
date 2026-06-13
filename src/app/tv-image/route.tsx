import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const tvUrl = `${origin}/tv`;

    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
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
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      await page.waitForTimeout(1500);

      const screenshot = await page.screenshot({
        type: "png",
        fullPage: false,
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
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}\n\n${error.stack}`
        : String(error);

    return new Response(message, {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}