import { NextResponse } from 'next/server';
import { verifiedAdmin } from '../../../../lib/supabase/server';
import { sameOrigin, withinBudget } from '../../../../lib/request-security';
export async function PATCH(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'Invalid request.'},{status:403});
 const admin=await verifiedAdmin();if(!admin)return NextResponse.json({error:'Sign in required.'},{status:401});
 try{
  if(!await withinBudget(request,'password',5,900))return NextResponse.json({error:'Please wait before trying again.'},{status:429});
  const {currentPassword,password}=await request.json();
  if(typeof password!=='string'||password.length<12||password.length>128||typeof currentPassword!=='string'||currentPassword.length>256)return NextResponse.json({error:'Use a new password with 12–128 characters.'},{status:400});
  const {error:loginError}=await admin.supabase.auth.signInWithPassword({email:admin.user.email!,password:currentPassword});if(loginError)return NextResponse.json({error:'Current password is incorrect.'},{status:400});
  const {error}=await admin.supabase.auth.updateUser({password});if(error)return NextResponse.json({error:'Password could not be updated. Choose a stronger password.'},{status:400});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Unable to update password.'},{status:500});}
}
