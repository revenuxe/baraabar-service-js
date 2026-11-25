import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { chromium } from 'playwright-core';

// Read-only rendering diagnostic. No email is sent, password changed, or lead modified.
const base = process.env.TEST_BASE_URL || 'http://localhost:3014';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const service = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const cookies = [];
const client = createServerClient(url, key, { cookies: { getAll: () => [], setAll: items => cookies.push(...items) } });
let browser;
try {
  const generated = await service.auth.admin.generateLink({ type: 'magiclink', email: 'admin@baraabar.com' });
  if (generated.error) throw new Error('Could not establish diagnostic admin session: ' + generated.error.message);
  const verified = await client.auth.verifyOtp({ token_hash: generated.data.properties.hashed_token, type: 'magiclink' });
  if (verified.error) throw new Error('Could not verify diagnostic session: ' + verified.error.message);
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext();
  await context.addCookies(cookies.map(cookie => ({ name: cookie.name, value: cookie.value, url: base, httpOnly: true, sameSite: 'Lax' })));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const failures = [];
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) failures.push(`${response.status()} ${new URL(response.url()).pathname}`); });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + '/admin/dashboard', { waitUntil: 'networkidle' });
    console.log(JSON.stringify({ width, path: new URL(page.url()).pathname, errors, failures }));
    await page.getByRole('heading', { name: 'Your service day, at a glance.' }).waitFor({ timeout: 10000 });
    await page.locator('.lead-skeleton').waitFor({ state: 'detached' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
    assert.equal(await page.locator('.admin-error').count(), 0, 'Dashboard data error');
    assert.equal(await page.locator('.wa-widget').count(), 0, 'Public chat visible in admin');
    console.log(`PASS: ${width}px dashboard renders with loaded data`);
  }
  for (const name of ['All leads', 'Trash', 'Account', 'Overview']) {
    await page.getByRole('navigation', { name: 'Admin navigation' }).getByRole('button', { name, exact: true }).click();
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.admin-error').count(), 0);
    console.log('PASS: admin navigation ' + name);
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
  assert.deepEqual(failures, [], 'Failed requests');
  const anonymous = await browser.newPage();
  await anonymous.goto(base + '/admin/dashboard');
  assert.ok(anonymous.url().endsWith('/admin/login'));
  const response = await anonymous.request.get(base + '/api/admin/leads');
  assert.equal(response.status(), 401);
  console.log('PASS: anonymous dashboard and API remain protected');
  // Exercise the browser's successful-login transition using the diagnostic session.
  // The password request is intercepted locally; no administrator password is needed.
  let intercepted = false;
  await anonymous.route('**/api/admin/login', async route => {
    intercepted = true;
    await anonymous.context().addCookies(cookies.map(cookie => ({ name: cookie.name, value: cookie.value, url: base, httpOnly: true, sameSite: 'Lax' })));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await anonymous.getByLabel('Password', { exact: true }).fill('local-intercepted-diagnostic');
  await anonymous.getByRole('button', { name: 'Sign in', exact: true }).click();
  await anonymous.getByRole('heading', { name: 'Your service day, at a glance.' }).waitFor();
  assert.ok(intercepted);
  assert.ok(anonymous.url().endsWith('/admin/dashboard'));
  console.log('PASS: successful-login browser transition opens the dashboard');
  await anonymous.context().clearCookies();
  await anonymous.getByRole('button', { name: 'Refresh leads', exact: true }).click();
  await anonymous.getByRole('heading', { name: 'Welcome back', exact: true }).waitFor();
  assert.ok(anonymous.url().endsWith('/admin/login'));
  console.log('PASS: expired session returns to sign in');
} catch (error) {
  console.error('FAIL:', error.message);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await client.auth.signOut({ scope: 'local' });
}
