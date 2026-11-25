const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks, env) {
 const exports = {};
 const code = ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(code,{exports,process:{env},Date,Error,require(name){
  if(name==='server-only')return {};
  if(name in mocks)return mocks[name];
  return require(name);
 }});
 return exports;
}

(async()=>{
 for(const scenario of ['missing','wrong-role','provider-failure','success']) {
  let signIns=0;
  const env={SUPABASE_SERVICE_ROLE_KEY:'must-never-be-used',SUPABASE_BACKEND_EMAIL:'backend@example.test',SUPABASE_BACKEND_PASSWORD:'test-only'};
  if(scenario==='missing')delete env.SUPABASE_BACKEND_PASSWORD;
  const client={auth:{signInWithPassword:async()=>{
   signIns++;
   return {data:{session:{expires_at:Math.floor(Date.now()/1000)+3600},user:{app_metadata:{role:scenario==='wrong-role'?'admin':'website_backend'}}},error:scenario==='provider-failure'?{message:'private provider detail'}:null};
  }}};
  const server=load('lib/supabase/server.ts',{
   '@supabase/ssr':{},'next/headers':{},
   './config':{publicSupabaseConfig:()=>({url:'https://example.test',key:'public-only'}),supabaseFetch:()=>{}},
   '@supabase/supabase-js':{createClient(url,key){assert.equal(key,'public-only');return client;}},
  },env);
  if(scenario==='success'){
   assert.equal(await server.backendClient(),client);
   assert.equal(await server.backendClient(),client);
   assert.equal(signIns,1,'Cache the backend session instead of authenticating for each request');
  }else{
   await assert.rejects(()=>server.backendClient(),/Restricted backend/);
   await assert.rejects(()=>server.backendClient(),/Restricted backend/);
   assert.equal(signIns,scenario==='missing'?0:2,'Failed authentication must be retried, never cached');
  }
  console.log('PASS: restricted backend '+scenario);
 }
 for(const scenario of ['missing-secret','rpc-error','invalid-result','exhausted','allowed']){
  let calls=0;
  const security=load('lib/request-security.ts',{
   './supabase/server':{backendClient:async()=>({rpc:async(name,args)=>{
    calls++;
    assert.equal(name,'consume_request_budget');
    assert.match(args.budget_key,/^[a-f0-9]{64}$/);
    assert.equal(args.max_hits,10);
    return {data:scenario==='invalid-result'?null:scenario==='allowed',error:scenario==='rpc-error'?{}:null};
   }})},
  },{REQUEST_BUDGET_SECRET:scenario==='missing-secret'?'':'x'.repeat(32)});
  const request=new Request('https://example.test',{headers:{'x-forwarded-for':'192.0.2.1'}});
  if(['missing-secret','rpc-error','invalid-result'].includes(scenario))await assert.rejects(()=>security.withinBudget(request,'admin-login',10,900));
  else assert.equal(await security.withinBudget(request,'admin-login',10,900),scenario==='allowed');
  assert.equal(calls,scenario==='missing-secret'?0:1);
  console.log('PASS: rate budget '+scenario);
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
