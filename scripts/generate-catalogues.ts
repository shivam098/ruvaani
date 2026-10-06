import { spawn, execFileSync } from "node:child_process";
import { mkdir, rename, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { catalogueEditions } from "../src/lib/discovery";

async function main() {
  const base = "http://127.0.0.1:3102";
  const output = resolve("public/catalogues");
  await mkdir(output, { recursive: true });
  const server = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "--port", "3102", "--hostname", "127.0.0.1"], {
    env: { ...process.env, DEMO_MODE: "true", ANALYTICS_ENABLED: "false", NEXT_PUBLIC_SITE_URL: base, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  let spawnError: Error | undefined;
  server.on("error", (error) => { spawnError = error; });
  server.stdout.on("data", (chunk) => { log = (log + chunk.toString()).slice(-8000); });
  server.stderr.on("data", (chunk) => { log = (log + chunk.toString()).slice(-8000); });
  const pending: string[] = [];
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    const deadline = Date.now() + 90000;
    while (!log.includes("Ready")) {
      if (spawnError) throw spawnError;
      if (server.exitCode !== null || Date.now() > deadline) throw new Error(`Catalogue server failed to start: ${log}`);
      await new Promise((done) => setTimeout(done, 200));
    }
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
    for (const edition of catalogueEditions) {
      const response = await page.goto(`${base}/catalogue/print/${edition.slug}`);
      if (!response?.ok()) throw new Error(`Unable to render ${edition.slug}: ${response?.status()}`);
      await page.evaluate(async () => {
        await document.fonts.ready;
        document.querySelectorAll("img").forEach((image) => { image.loading = "eager"; });
        await Promise.all(Array.from(document.images, (image) => image.decode()));
      });
      const clipped = await page.locator(".print-catalogue > section").evaluateAll((sections) => sections.some((section) => section.scrollHeight > section.clientHeight + 1));
      if (clipped) throw new Error(`Catalogue ${edition.slug} has clipped content. Adjust the print layout before publishing.`);
      const file = resolve(output, `ruvaani-${edition.slug}.pdf.pending`);
      pending.push(file);
      await page.pdf({ path: file, format: "A4", preferCSSPageSize: true, printBackground: true, tagged: true });
      execFileSync("python", [resolve("scripts/optimize-catalogue-pdf.py"), file], { stdio: "inherit" });
      console.log(`Rendered ${edition.slug}.`);
    }
    for (const file of pending) await rename(file, file.replace(/\.pending$/, ""));
    console.log("Seven branded catalogues generated from the current collection.");
  } finally {
    try { await browser?.close(); }
    finally {
      if (server.pid && server.exitCode === null) {
        if (process.platform === "win32") execFileSync("powershell.exe", ["-NoProfile", "-Command", `function Stop-CatalogueProcessTree([int]$ProcessId) { Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId" | ForEach-Object { Stop-CatalogueProcessTree $_.ProcessId }; Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue }; Stop-CatalogueProcessTree ${server.pid}`], { stdio: "ignore" });
        else server.kill("SIGTERM");
      }
      for (const file of pending) await rm(file, { force: true });
    }
  }
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
