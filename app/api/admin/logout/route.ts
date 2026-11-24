import { NextResponse } from 'next/server';
import { userClient } from '../../../../lib/supabase/server';
import { sameOrigin } from '../../../../lib/request-security';
export async function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({error:'Invalid request.'},{status:403});const client=await userClient();const {error}=await client.auth.signOut();return NextResponse.json({ok:!error},{status:error?500:200});}
