import { pageMetadata } from '../lib/seo';
import { PageSchema } from './page-schema';
import { LandingPage } from './landing-page';
import type { Metadata } from 'next';
export const metadata: Metadata = pageMetadata('/');
export const dynamic = 'force-dynamic';
export default function Home() { return <><PageSchema path="/"/><LandingPage/></>; }
