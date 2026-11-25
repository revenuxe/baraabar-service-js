// Trusted local provisioning only. Never import this script into application code.
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url || !key)throw new Error('Trusted local provisioning credentials are required.');
const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const email=process.env.SUPABASE_BACKEND_EMAIL || 'website-backend@baraabar.com';
const password=process.env.SUPABASE_BACKEND_PASSWORD || randomBytes(48).toString('base64url');
let existing;
for(let page=1;page<=100;page++){
 const {data,error}=await admin.auth.admin.listUsers({page,perPage:100});
 if(error)throw new Error('Unable to inspect backend account.');
 existing=data.users.find(user=>user.email?.toLowerCase()===email.toLowerCase());
 if(existing || data.users.length<100)break;
}
if(existing){
 if(existing.app_metadata.role!=='website_backend' || !process.env.SUPABASE_BACKEND_PASSWORD)throw new Error('Existing account requires manual review; credentials were not changed.');
 console.log('Restricted backend account already exists; existing credentials preserved.');
}else{
 const {error}=await admin.auth.admin.createUser({email,password,email_confirm:true,app_metadata:{role:'website_backend'}});
 if(error)throw new Error('Unable to create restricted backend account.');
 console.log('Created restricted backend account.');
}
let env=readFileSync('.env.local','utf8');
for(const [name,value] of Object.entries({SUPABASE_BACKEND_EMAIL:email,SUPABASE_BACKEND_PASSWORD:password,REQUEST_BUDGET_SECRET:process.env.REQUEST_BUDGET_SECRET || randomBytes(48).toString('base64url')})){
 const pattern=new RegExp('^'+name+'=.*$','m');
 env=pattern.test(env)?env.replace(pattern,()=>name+'='+value):env.trimEnd()+'\n'+name+'='+value+'\n';
}
writeFileSync('.env.local',env,{mode:0o600});
console.log('Saved backend credentials and rate-budget secret to ignored .env.local. No secret values printed.');
