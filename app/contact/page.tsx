import { pageMetadata } from '../../lib/seo';
import { PageSchema } from '../page-schema';
import type { Metadata } from 'next';
import { ContactForm } from '../contact-form';
import { CompanyHeader, CompanyFooter, ContactDetails } from '../company-components';
export const metadata: Metadata = pageMetadata('/contact');
export default function ContactPage() {return <><PageSchema path="/contact"/><CompanyHeader/><main><div className="contact-page-title"><h1>Contact Baraabar in Bengaluru</h1><p>Let us help with your washing machine.</p></div><section className="contact-direct"><ContactDetails/></section><ContactForm/></main><CompanyFooter/></>}
