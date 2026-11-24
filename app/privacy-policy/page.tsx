import type { Metadata } from 'next';
import { PolicyLayout } from '../policy-layout';
import { privacy } from '../legal-content';
export const metadata: Metadata = {title:'Privacy Policy | Baraabar',description:'How Baraabar handles service enquiry information, browser storage, data sharing, retention, and privacy requests.'};
export default function PrivacyPage(){return <PolicyLayout title="Privacy Policy" description="How we handle your information when you contact Baraabar." sections={privacy}/>}
