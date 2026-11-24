import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { verifiedAdmin } from '../../../lib/supabase/server';
import { Dashboard } from './workspace';
export const metadata:Metadata={title:'Lead Dashboard'};
export default async function DashboardPage(){const admin=await verifiedAdmin();if(!admin)redirect('/admin/login');return <Dashboard email={admin.user.email!}/>}
