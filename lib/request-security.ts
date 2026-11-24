import 'server-only';
import { createHmac } from 'node:crypto';
import { serviceClient } from './supabase/server';
export function sameOrigin(request:Request) {
 const origin=request.headers.get('origin');
 if(!origin)return true;
 const url=new URL(request.url);
 const host=request.headers.get('host')||url.host;
 const protocol=request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()||url.protocol.replace(':','');
 return origin === `${protocol}://${host}`;
}
export async function withinBudget(request:Request,scope:string,limit:number,seconds:number) {
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
 const key=createHmac('sha256',process.env.SUPABASE_SERVICE_ROLE_KEY!).update(`${scope}:${ip}`).digest('hex');
 const {data,error}=await serviceClient().rpc('consume_request_budget',{budget_key:key,max_hits:limit,window_secs:seconds});
 return !error && data === true;
}
