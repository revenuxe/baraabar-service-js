import { NextResponse } from 'next/server';
import { userClient } from '../../../../lib/supabase/server';
import { sameOrigin, withinBudget } from '../../../../lib/request-security';
export async function POST(request:Request) {
 if(!sameOrigin(request))return NextResponse.json({error:'Invalid request.'},{status:403});
 let stage='LOGIN_REQUEST';
 try{
  const body=await request.text();if(body.length>2000)return NextResponse.json({error:'Invalid credentials.'},{status:400});
  let payload;
  try{payload=JSON.parse(body)}catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
  if(!payload || typeof payload!=='object')return NextResponse.json({error:'Invalid request.'},{status:400});
  const {email,password}=payload;
  if(typeof email!=='string'||email.trim().toLowerCase()!=='admin@baraabar.com'||typeof password!=='string'||password.length>256)return NextResponse.json({error:'Invalid email or password.'},{status:401});
  stage='LOGIN_RATE_LIMIT_UNAVAILABLE';
  if(!await withinBudget(request,'admin-login',10,900))return NextResponse.json({error:'Too many login attempts. Please try again in 15 minutes.'},{status:429});
  stage='LOGIN_AUTH_UNAVAILABLE';
  const supabase=await userClient();
  const {data,error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});
  if(error && (error.name==='AuthRetryableFetchError'||(error.status && error.status>=500)))throw new Error('Authentication provider unavailable.');
  if(error||data.user?.app_metadata.role!=='admin'){await supabase.auth.signOut();return NextResponse.json({error:'Invalid email or password.'},{status:401});}
  return NextResponse.json({ok:true});
 }catch{
  // Stable stage references help diagnose production without exposing passwords,
  // tokens, provider responses or private configuration in logs or the browser.
  console.error('[admin-login]',stage);
  return NextResponse.json({error:`Sign-in is temporarily unavailable. Please try again. Reference: ${stage}`,code:stage},{status:503,headers:{'Cache-Control':'private, no-store','Retry-After':'30'}});
 }
}
