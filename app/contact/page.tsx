import type { Metadata } from 'next';
import { ContactForm } from '../contact-form';
import { CompanyHeader, CompanyFooter, ContactDetails } from '../company-components';
export const metadata: Metadata = { title: 'Contact Us | Baraabar Washing Machine Repair', description: 'Call Baraabar on +91 9886285028 or request washing machine service in Bengaluru.' };
export default function ContactPage() {return <><CompanyHeader/><main><div className="contact-page-title"><h1>Contact Us</h1><p>Let us help with your washing machine.</p></div><section className="contact-direct"><ContactDetails/></section><ContactForm/></main><CompanyFooter/></>}
