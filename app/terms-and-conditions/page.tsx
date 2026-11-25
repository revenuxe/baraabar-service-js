import { pageMetadata } from '../../lib/seo';
import { PageSchema } from '../page-schema';
import type { Metadata } from 'next';
import { PolicyLayout } from '../policy-layout';
import { terms } from '../legal-content';
export const metadata: Metadata = pageMetadata('/terms-and-conditions');
export default function TermsPage(){return <><PageSchema path="/terms-and-conditions"/><PolicyLayout title="Terms & Conditions" description="Clear expectations for your enquiry, assessment, and repair." sections={terms}/></>}
