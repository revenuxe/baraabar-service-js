const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('app/api/admin/login/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;

(async () => {
  for (const scenario of ['budget-unavailable', 'budget-exhausted', 'auth-unavailable', 'invalid-password', 'success', 'malformed']) {
    let authCalls = 0;
    const exports = {};
    vm.runInNewContext(code, { exports, console: { error() {} }, require(name) {
      if (name.endsWith('/request-security')) return {
        sameOrigin: () => true,
        withinBudget: async () => { if (scenario === 'budget-unavailable') throw new Error('test backend unavailable'); return scenario !== 'budget-exhausted'; },
      };
      if (name.endsWith('/supabase/server')) return { userClient: async () => {
        authCalls++;
        return { auth: {
          signInWithPassword: async () => ({ data: { user: scenario === 'success' ? { app_metadata: { role: 'admin' } } : null }, error: scenario === 'auth-unavailable' ? { name: 'AuthRetryableFetchError', status: 503 } : scenario === 'invalid-password' ? { name: 'AuthApiError', status: 400 } : null }),
          signOut: async () => ({}),
        } };
      } };
      return require(name);
    } });
    const request = new Request('https://www.baraabar.com/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: scenario === 'malformed' ? 'null' : JSON.stringify({ email: 'admin@baraabar.com', password: 'test-only-password' }) });
    const response = await exports.POST(request);
    const data = await response.json();
    const expected = { 'budget-unavailable': 503, 'budget-exhausted': 429, 'auth-unavailable': 503, 'invalid-password': 401, success: 200, malformed: 400 };
    assert.equal(response.status, expected[scenario], scenario);
    if (scenario === 'budget-unavailable') assert.equal(data.code, 'LOGIN_RATE_LIMIT_UNAVAILABLE');
    if (scenario === 'auth-unavailable') assert.equal(data.code, 'LOGIN_AUTH_UNAVAILABLE');
    if (['budget-unavailable', 'budget-exhausted', 'malformed'].includes(scenario)) assert.equal(authCalls, 0, 'Authentication must not bypass validation or rate limiting');
    assert.ok(!JSON.stringify(data).includes('test-only-password'));
    console.log('PASS: ' + scenario);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
