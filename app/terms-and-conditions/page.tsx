import type { Metadata } from 'next';
import { PolicyLayout } from '../policy-layout';
import { terms } from '../legal-content';
export const metadata: Metadata = {title:'Terms & Conditions | Baraabar',description:'Terms for Baraabar washing machine service enquiries, pricing, repair approval, appointments, cancellations, warranties, and complaints.'};
export default function TermsPage(){return <PolicyLayout title="Terms & Conditions" description="Clear expectations for your enquiry, assessment, and repair." sections={terms}/>}
