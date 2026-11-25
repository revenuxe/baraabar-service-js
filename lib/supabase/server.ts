import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
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
export function serviceClient() {
 const config = publicSupabaseConfig();
 const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
 if (!config || !key) throw new Error('Service enquiry storage is not configured on this server.');
 return createClient(config.url,key,{global:{fetch:supabaseFetch},auth:{persistSession:false,autoRefreshToken:false}});
}
export async function verifiedAdmin() {
 const supabase = await userClient();
 const {data:{user},error} = await supabase.auth.getUser();
 if (error || !user || user.email?.toLowerCase() !== 'admin@baraabar.com' || user.app_metadata.role !== 'admin') return null;
 return {supabase,user};
}
