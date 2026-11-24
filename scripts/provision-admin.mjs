import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
let existing=null;
for(let page=1;page<=100;page++){const {data,error}=await client.auth.admin.listUsers({page,perPage:100});if(error)throw new Error('Unable to inspect admin account');existing=data.users.find(u=>u.email?.toLowerCase()==='admin@baraabar.com');if(existing||data.users.length<100)break;}
if(existing){const {error}=await client.auth.admin.updateUserById(existing.id,{app_metadata:{...existing.app_metadata,role:'admin'}});if(error)throw new Error('Unable to assign admin role');console.log('Existing admin account granted application admin access. Existing password preserved.');}
else{const password=randomBytes(24).toString('base64url')+'!aA9';const {data,error}=await client.auth.admin.createUser({email:'admin@baraabar.com',password,email_confirm:true,app_metadata:{role:'admin'}});if(error)throw new Error('Unable to create administrator');writeFileSync('.admin-credentials.local.txt',`Baraabar admin\nLogin: /admin/login\nEmail: admin@baraabar.com\nTemporary password: ${password}\nChange this password in the admin account settings after login.\n`,{mode:0o600});console.log('Admin created with full application access. Initial credentials saved in ignored .admin-credentials.local.txt.');}
