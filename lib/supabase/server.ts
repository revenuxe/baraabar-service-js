import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function userClient() {
 const jar = await cookies();
 return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  cookieOptions: {httpOnly:true, sameSite:'lax', secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false'},
  cookies:{getAll(){return jar.getAll()},setAll(values){try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* Server Components cannot set cookies. The proxy refreshes sessions. */}}},
 });
}
export function serviceClient() {
 return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function verifiedAdmin() {
 const supabase = await userClient();
 const {data:{user},error} = await supabase.auth.getUser();
 if (error || !user || user.email?.toLowerCase() !== 'admin@baraabar.com' || user.app_metadata.role !== 'admin') return null;
 return {supabase,user};
}
