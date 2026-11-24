import { NextResponse } from 'next/server';
import { verifiedAdmin } from '../../../../lib/supabase/server';
import { statuses } from '../../../../lib/leads';
import { sameOrigin } from '../../../../lib/request-security';
import { services } from '../../../../lib/services';
export async function GET(request:Request){
 const admin=await verifiedAdmin();if(!admin)return NextResponse.json({error:'Sign in required.'},{status:401});
 const params=new URL(request.url).searchParams;
 const page=Math.max(1,Math.min(10000,Number(params.get('page'))||1));
 const q=(params.get('q')||'').replace(/[^a-zA-Z0-9\s]/g,'').trim().slice(0,80);
 const status=params.get('status');const trash=params.get('trash')==='true';
 let query=admin.supabase.from('leads').select('*',{count:'exact'}).order('created_at',{ascending:false});
 query=trash?query.not('deleted_at','is',null):query.is('deleted_at',null);
 if(status&&statuses.includes(status as typeof statuses[number]))query=query.eq('status',status);
 if(q)query=query.or(`name.ilike.%${q}%,mobile.ilike.%${q}%,pincode.ilike.%${q}%`);
 const {data,error,count}=await query.range((page-1)*20,page*20-1);
 if(error)return NextResponse.json({error:'Could not load leads.'},{status:500});
 return NextResponse.json({leads:data,total:count,page},{headers:{'Cache-Control':'private, no-store'}});
}
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'Invalid request.'},{status:403});
 const admin=await verifiedAdmin();if(!admin)return NextResponse.json({error:'Sign in required.'},{status:401});
 try{const raw=await request.text();if(raw.length>8000)throw new Error();const body=JSON.parse(raw);
 if(typeof body.name!=='string'||body.name.trim().length<2||body.name.length>100||typeof body.mobile!=='string'||!/^[6-9]\d{9}$/.test(body.mobile)||typeof body.pincode!=='string'||!/^[1-9]\d{5}$/.test(body.pincode)||!Array.isArray(body.services)||body.services.length>services.length||!body.services.every((s:unknown)=>typeof s==='string'&&services.some(item=>item.title===s)))throw new Error();
 const selected=services.filter(s=>body.services.includes(s.title)).map(({title,price,starting})=>({title,price,starting}));const {data,error}=await admin.supabase.from('leads').insert({name:body.name.trim(),mobile:body.mobile,pincode:body.pincode,services:selected,estimated_amount:selected.reduce((sum,s)=>sum+s.price,0),source:'admin'}).select().single();if(error)throw error;return NextResponse.json({lead:data},{status:201});
 }catch{return NextResponse.json({error:'Please check the customer details and services.'},{status:400});}
}
