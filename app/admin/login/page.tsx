import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { verifiedAdmin } from '../../../lib/supabase/server';
import { LoginForm } from './login-form';
export const metadata:Metadata={title:'Admin Login'};
export default async function LoginPage(){if(await verifiedAdmin())redirect('/admin/dashboard');return <LoginForm/>}
