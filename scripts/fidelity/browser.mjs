/* Headless Microsoft Edge / Chrome via puppeteer-core: load a page, let its scripts run, return the final DOM. */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const CANDIDATES = [process.env.BROWSER_PATH, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);

/* Starts the browser ourselves on a debugging port and connects (puppeteer's own launcher exits early with
   some Edge installs on Windows). The temporary profile is removed on close. */
export async function openBrowser() {
  const executablePath = CANDIDATES.find(p => fs.existsSync(p));
  if (!executablePath) throw new Error('No Edge/Chrome found — set BROWSER_PATH');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-browser-'));
  const port = 9300 + Math.floor(Math.random() * 600);
  const proc = spawn(executablePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions', `--user-data-dir=${dir}`, `--remote-debugging-port=${port}`, '--window-size=1400,900', 'about:blank'], { stdio: 'ignore' });
  let ws = null;
  for (let i = 0; i < 60 && !ws; i++) {
    await new Promise(r => setTimeout(r, 250));
    try { ws = (await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()).webSocketDebuggerUrl; } catch (e) { /* not up yet */ }
  }
  if (!ws) { proc.kill(); throw new Error('Browser did not start'); }
  const browser = await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: { width: 1400, height: 900 } });
  const close = browser.close.bind(browser);
  browser.close = async () => { try { await close(); } catch (e) { proc.kill(); } setTimeout(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* in use */ } }, 1500); };
  return browser;
}

/* Browser that survives crashes: capture() relaunches it when the connection drops, retries the page once,
   and recycles the browser every `recycle` pages to keep memory flat. */
export function browserPool({ recycle = 60 } = {}) {
  let b = null, starting = null, used = 0;
  const get = async () => {
    if (b && b.connected && used < recycle) return b;
    if (!starting) starting = (async () => { const old = b; b = null; used = 0; if (old) old.close().catch(() => {}); b = await openBrowser(); return b; })().finally(() => { starting = null; });
    return starting;
  };
  return {
    async capture(url, opts) {
      for (let attempt = 0; ; attempt++) {
        const br = await get(); used++;
        try { return await capture(br, url, opts); }
        catch (e) { if (attempt >= 1 || !/closed|disconnected|Target|Protocol error/i.test(e.message)) throw e; if (b === br) used = recycle; }
      }
    },
    close: async () => { if (b) await b.close(); },
  };
}

/* returns { app, head, foot, errors[] } — innerHTML of #app, header and footer after the page settled.
   A fresh browser context per page = empty localStorage (first-visit state). */
export async function capture(browser, url, { settleMs = 700, extra } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  const NOISE = ['Failed to load resource', 'favicon', '_next/hmr', 'webpack-hmr']; /* dev-server / network noise, not page errors */
  page.on('console', m => { if (m.type() === 'error' && !NOISE.some(n => m.text().includes(n))) errors.push(m.text()); });
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 120000 }); /* the shared dev server is slow under load */
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 8000 }).catch(() => {}); /* dev servers keep a live-reload connection open */
    await new Promise(r => setTimeout(r, settleMs));
    if (extra) await extra(page);
    const out = await page.evaluate(() => {
      const h = s => { const e = document.querySelector(s); return e ? e.innerHTML : null; };
      return { app: h('#app'), head: h('#head'), foot: h('#foot'), drawer: h('#drawer'), bnav: h('#bnav'), title: document.title };
    });
    return { ...out, errors };
  } finally { await ctx.close(); }
}
