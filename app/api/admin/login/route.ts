import { NextResponse } from 'next/server';
import { userClient } from '../../../../lib/supabase/server';
import { sameOrigin, withinBudget } from '../../../../lib/request-security';
export async function POST(request:Request) {
 if(!sameOrigin(request))return NextResponse.json({error:'Invalid request.'},{status:403});
 try{
  const body=await request.text();if(body.length>2000)return NextResponse.json({error:'Invalid credentials.'},{status:400});
  const {email,password}=JSON.parse(body);
  if(typeof email!=='string'||email.trim().toLowerCase()!=='admin@baraabar.com'||typeof password!=='string'||password.length>256)return NextResponse.json({error:'Invalid email or password.'},{status:401});
  if(!await withinBudget(request,'admin-login',10,900))return NextResponse.json({error:'Too many login attempts. Please try again in 15 minutes.'},{status:429});
  const supabase=await userClient();
  const {data,error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});
  if(error||data.user?.app_metadata.role!=='admin'){await supabase.auth.signOut();return NextResponse.json({error:'Invalid email or password.'},{status:401});}
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Unable to sign in. Please try again.'},{status:503});}
}
