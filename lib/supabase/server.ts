import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { publicSupabaseConfig, supabaseFetch } from './config';

export async function userClient() {
 const config = publicSupabaseConfig();
 if (!config) throw new Error('Admin authentication is not configured on this server.');
 const jar = await cookies();
 return createServerClient(config.url, config.key, {
  global: { fetch: supabaseFetch },
  cookieOptions: {httpOnly:true, sameSite:'lax', secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false'},
  cookies:{getAll(){return jar.getAll()},setAll(values){try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* Server Components cannot set cookies. The proxy refreshes sessions. */}}},
 });
}
let backendSession: Promise<{client: SupabaseClient; expiresAt: number}> | undefined;
export async function backendClient() {
 const config = publicSupabaseConfig();
 const email = process.env.SUPABASE_BACKEND_EMAIL?.trim();
 const password = process.env.SUPABASE_BACKEND_PASSWORD;
 if (!config || !email || !password) throw new Error('Restricted backend account is not configured.');
 if (backendSession) {
  const session = await backendSession;
  if (session.expiresAt > Date.now() + 60000) return session.client;
  backendSession = undefined;
 }
 backendSession = (async () => {
  const client = createClient(config.url,config.key,{global:{fetch:supabaseFetch},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const {data,error} = await client.auth.signInWithPassword({email,password});
  if (error || !data.session || data.user?.app_metadata.role !== 'website_backend') throw new Error('Restricted backend authentication failed.');
  return {client,expiresAt:(data.session.expires_at ?? 0)*1000};
 })();
 try { return (await backendSession).client; }
 catch { backendSession = undefined; throw new Error('Restricted backend authentication failed.'); }
}
export async function verifiedAdmin() {
 const supabase = await userClient();
 const {data:{user},error} = await supabase.auth.getUser();
 if (error || !user || user.email?.toLowerCase() !== 'admin@baraabar.com' || user.app_metadata.role !== 'admin') return null;
 return {supabase,user};
}
