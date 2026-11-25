const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');

// Exercise the real proxy with isolated environment variables and a failing
// provider. No credentials, network calls or alternate production build needed.
function load(source, dependencies, env = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, require: name => dependencies[name] || require(name), process: { env }, URL, AbortSignal, fetch, console: { error() {} } }, { filename: source });
  return exports;
}

(async () => {
  for (const scenario of ['missing', 'invalid', 'connection']) {
    const env = scenario === 'missing' ? {} : { NEXT_PUBLIC_SUPABASE_URL: scenario === 'invalid' ? 'invalid' : 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-only-key' };
    const config = load('lib/supabase/config.ts', {}, env);
    let providerCalls = 0;
    const { proxy } = load('proxy.ts', {
      './lib/supabase/config': config,
      '@supabase/ssr': { createServerClient() { providerCalls++; throw new Error('Simulated provider failure'); } },
    }, env);
    for (const path of ['/admin/login', '/admin/dashboard', '/api/admin/leads']) {
      const response = await proxy(new NextRequest('https://www.baraabar.com' + path));
      assert.equal(response.status, 503);
      assert.match(response.headers.get('cache-control'), /no-store/);
      assert.match(response.headers.get('x-robots-tag'), /noindex/);
      const body = await response.text();
      assert.ok(!body.includes('test-only-key'));
      if (path.startsWith('/api/')) assert.ok(JSON.parse(body).error);
      else {
        assert.ok(body.includes('Admin sign-in is temporarily unavailable'));
        assert.ok(body.includes(scenario === 'connection' ? 'AUTH_CONNECTION' : 'AUTH_CONFIGURATION'));
        assert.ok(body.includes('href="/"'));
      }
    }
    assert.equal(providerCalls, scenario === 'connection' ? 3 : 0);
    console.log('PASS: ' + scenario + ' authentication recovery, status, noindex, no caching and no key exposure');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
