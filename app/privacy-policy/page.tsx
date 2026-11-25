import { pageMetadata } from '../../lib/seo';
import { PageSchema } from '../page-schema';
import type { Metadata } from 'next';
import { PolicyLayout } from '../policy-layout';
import { privacy } from '../legal-content';
export const metadata: Metadata = pageMetadata('/privacy-policy');
export default function PrivacyPage(){return <><PageSchema path="/privacy-policy"/><PolicyLayout title="Privacy Policy" description="How we handle your information when you contact Baraabar." sections={privacy}/></>}
