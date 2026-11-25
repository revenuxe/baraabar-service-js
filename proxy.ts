import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { publicSupabaseConfig, supabaseFetch } from './lib/supabase/config';

function unavailable(request: NextRequest, reason: 'configuration' | 'connection') {
 const headers = {'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','Retry-After':'30'};
 if(request.nextUrl.pathname.startsWith('/api/'))return NextResponse.json({error:'Admin sign-in is temporarily unavailable. Please try again shortly.'},{status:503,headers});
 // Proxy failures occur outside React's route error boundaries. Return a visible
 // recovery page here instead of Vercel's plain "Internal Server Error" response.
 const detail=reason==='configuration'?'The administrator needs to finish the sign-in configuration.':'We could not connect to the sign-in service. Please try again shortly.';
 return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Admin sign-in unavailable | Baraabar</title></head><body style="margin:0;background:#f5f7fb;color:#002048;font:16px/1.7 Arial,sans-serif;min-height:100vh;display:grid;place-items:center"><main style="margin:24px;padding:32px;max-width:520px;background:white;border:1px solid #e1e8f1;border-radius:16px"><p>BARAABAR ADMIN</p><h1 style="font-size:26px;line-height:1.3">Admin sign-in is temporarily unavailable</h1><p>${detail}</p><p><a href="/admin/login" style="color:#002048;margin-right:24px">Try sign-in again</a><a href="/" style="color:#002048">Go to the website</a></p><small>Reference: AUTH_${reason.toUpperCase()}</small></main></body></html>`,{status:503,headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
}

export async function proxy(request: NextRequest) {
 const config=publicSupabaseConfig();
 if(!config){console.error('[admin-auth] Missing or invalid NEXT_PUBLIC_SUPABASE_URL or public Supabase key in this deployment.');return unavailable(request,'configuration')}
 try {
 let response = NextResponse.next({request});
 const supabase = createServerClient(config.url,config.key,{
 global:{fetch:supabaseFetch},
 cookieOptions:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production' && process.env.COOKIE_SECURE !== 'false'},
 cookies:{getAll:()=>request.cookies.getAll(),setAll(values){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));}},
 });
 const {error}=await supabase.auth.getUser();
 if(error && (error.name==='AuthRetryableFetchError' || (error.status && error.status>=500))){console.error('[admin-auth] Authentication provider unavailable.',error.name,error.status);return unavailable(request,'connection')}
 response.headers.set('Cache-Control','private, no-store');
 response.headers.set('X-Robots-Tag','noindex, nofollow');
 return response;
 }catch{console.error('[admin-auth] Failed to initialize or connect to authentication.');return unavailable(request,'connection')}
}
export const config = {matcher:['/admin/:path*','/api/admin/:path*']};
