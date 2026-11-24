import type { Metadata } from 'next';
import './admin.css';
export const metadata: Metadata={title:{default:'Baraabar Admin',template:'%s | Baraabar Admin'},robots:{index:false,follow:false}};
export default function AdminLayout({children}:{children:React.ReactNode}){return <div className="admin-app">{children}</div>}
