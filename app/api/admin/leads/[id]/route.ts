import { NextResponse } from 'next/server';
import { verifiedAdmin } from '../../../../../lib/supabase/server';
import { sameOrigin } from '../../../../../lib/request-security';
import { statuses } from '../../../../../lib/leads';
type Context={params:Promise<{id:string}>};
const validId=(id:string)=>/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id);
export async function GET(_request:Request,context:Context){const admin=await verifiedAdmin();if(!admin)return NextResponse.json({error:'Sign in required.'},{status:401});const {id}=await context.params;if(!validId(id))return NextResponse.json({error:'Invalid lead.'},{status:400});const {data,error}=await admin.supabase.from('leads').select('*').eq('id',id).single();if(error)return NextResponse.json({error:'Lead not found.'},{status:404});const events=await admin.supabase.from('lead_events').select('id,action,created_at').eq('lead_id',id).order('created_at',{ascending:false}).limit(100);return NextResponse.json({lead:data,events:events.data||[]},{headers:{'Cache-Control':'private, no-store'}});}
export async function PATCH(request:Request,context:Context){
 if(!sameOrigin(request))return NextResponse.json({error:'Invalid request.'},{status:403});
 const admin=await verifiedAdmin();if(!admin)return NextResponse.json({error:'Sign in required.'},{status:401});
 const {id}=await context.params;if(!validId(id))return NextResponse.json({error:'Invalid lead.'},{status:400});
 try{
  const raw=await request.text();if(raw.length>16000)throw new Error();const body=JSON.parse(raw);const patch:Record<string,unknown>={};
  for(const key of ['name','mobile','pincode','notes','address','assigned_to'])if(key in body){if(typeof body[key]!=='string')throw new Error();patch[key]=body[key].trim();}
  if(patch.name!==undefined&&((patch.name as string).length<2||(patch.name as string).length>100))throw new Error();
  if(patch.mobile!==undefined&&!/^[6-9]\d{9}$/.test(patch.mobile as string))throw new Error();
  if(patch.pincode!==undefined&&!/^[1-9]\d{5}$/.test(patch.pincode as string))throw new Error();
  if((patch.notes as string)?.length>5000||(patch.address as string)?.length>1000||(patch.assigned_to as string)?.length>100)throw new Error();
  if('status'in body){if(!statuses.includes(body.status))throw new Error();patch.status=body.status;}
  if('scheduled_at'in body){if(body.scheduled_at!==null&&(typeof body.scheduled_at!=='string'||Number.isNaN(Date.parse(body.scheduled_at))))throw new Error();patch.scheduled_at=body.scheduled_at;}
  if('restore'in body){if(body.restore!==true)throw new Error();patch.deleted_at=null;}
  if(Object.keys(patch).length===0)throw new Error();
  const {data,error}=await admin.supabase.from('leads').update(patch).eq('id',id).select().single();if(error)return NextResponse.json({error:'Could not save changes.'},{status:500});return NextResponse.json({lead:data});
 }catch{return NextResponse.json({error:'Please check the lead details and try again.'},{status:400});}
}
export async function DELETE(request:Request,context:Context){if(!sameOrigin(request))return NextResponse.json({error:'Invalid request.'},{status:403});const admin=await verifiedAdmin();if(!admin)return NextResponse.json({error:'Sign in required.'},{status:401});const {id}=await context.params;if(!validId(id))return NextResponse.json({error:'Invalid lead.'},{status:400});const permanent=new URL(request.url).searchParams.get('permanent')==='true';let query;if(permanent){query=admin.supabase.from('leads').delete().eq('id',id).not('deleted_at','is',null).select('id');}else{query=admin.supabase.from('leads').update({deleted_at:new Date().toISOString()}).eq('id',id).select('id');}const {data,error}=await query;if(error)return NextResponse.json({error:'Could not delete lead.'},{status:500});if(!data?.length)return NextResponse.json({error:'Lead not found or not in trash.'},{status:404});return NextResponse.json({ok:true});}
