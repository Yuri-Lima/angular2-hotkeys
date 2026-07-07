#!/usr/bin/env node
/**
 * Phase 8 browser proof: hits the test-app on :4300 and exercises
 * ?, Esc, ctrl+s. Requires: test-app served, playwright available.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'ui');
mkdirSync(outDir, { recursive: true });

let chromium;
try {
  ({ chromium } = require('/tmp/pw-run/node_modules/playwright'));
} catch {
  ({ chromium } = require('playwright'));
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('http://127.0.0.1:4300/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const h1 = await page.locator('h1').textContent();
if (!h1?.includes('test-app')) throw new Error('test-app did not render');

await page.keyboard.press('Shift+Slash');
await page.waitForTimeout(400);
const open = await page.locator('.cfp-hotkeys-container.in').count();
if (open !== 1) throw new Error('? did not open cheatsheet');

await page.keyboard.press('Escape');
await page.waitForTimeout(400);
if ((await page.locator('.cfp-hotkeys-container.in').count()) !== 0) {
  throw new Error('Esc did not close cheatsheet');
}

await page.keyboard.press('Control+KeyS');
await page.waitForTimeout(400);
const last = await page.locator('#last-action').textContent();
if (!last?.includes('Save')) throw new Error('ctrl+s did not fire');

await page.screenshot({ path: join(outDir, 'proof-test-app.png'), fullPage: true });
await page.keyboard.press('Shift+Slash');
await page.waitForTimeout(300);
await page.screenshot({ path: join(outDir, 'proof-cheatsheet.png'), fullPage: true });

await browser.close();

if (errors.length) {
  console.error(errors);
  process.exit(1);
}
console.log('Phase 8 browser proof: PASS (?, Esc, ctrl+s)');
