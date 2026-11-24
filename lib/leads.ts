export const statuses = ['new','contacted','scheduled','in_progress','completed','cancelled'] as const;
export type LeadStatus = typeof statuses[number];
export type Lead = {id:string;name:string;mobile:string;pincode:string;services:{title:string;price:number;starting:boolean}[];estimated_amount:number;status:LeadStatus;notes:string;address:string;assigned_to:string;scheduled_at:string|null;created_at:string;updated_at:string;deleted_at:string|null;source:string};
export const statusLabel = (value:string) => value.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
export const money = (amount:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(amount);
