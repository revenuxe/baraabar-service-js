import { NextResponse } from 'next/server';
import { services } from '../../../lib/services';
import { serviceClient } from '../../../lib/supabase/server';
import { sameOrigin, withinBudget } from '../../../lib/request-security';
export async function POST(request: Request) {
 if (!sameOrigin(request)) return NextResponse.json({error:'Invalid request origin.'},{status:403});
 let data;
 try {const body=await request.text();if(body.length>8000)throw new Error();data=JSON.parse(body);}catch{return NextResponse.json({error:'Invalid request.'},{status:400});}
 if(!data || typeof data.name!=='string' || data.name.trim().length<2 || data.name.length>100 || typeof data.mobile!=='string' || !/^[6-9]\d{9}$/.test(data.mobile) || typeof data.pincode!=='string' || !/^[1-9]\d{5}$/.test(data.pincode) || !Array.isArray(data.services) || data.services.length>services.length || !data.services.every((title:unknown)=>typeof title==='string'&&services.some(s=>s.title===title)))return NextResponse.json({error:'Enter your name, a valid 10-digit mobile number, and a 6-digit PIN code.'},{status:400});
 try {
  if(!await withinBudget(request,'contact',8,600))return NextResponse.json({error:'Too many enquiries. Please wait a few minutes or call +91 9886285028.'},{status:429});
  const selected=services.filter(s=>data.services.includes(s.title)).map(({title,price,starting})=>({title,price,starting}));
  const {data:lead,error}=await serviceClient().from('leads').insert({name:data.name.trim(),mobile:data.mobile,pincode:data.pincode,services:selected,estimated_amount:selected.reduce((total,s)=>total+s.price,0),source:'website'}).select('id').single();
  if(error)throw error;
  return NextResponse.json({ok:true,reference:lead.id.slice(0,8).toUpperCase()},{status:201});
 }catch{return NextResponse.json({error:'We could not save your enquiry. Please try again or call +91 9886285028.'},{status:503});}
}
