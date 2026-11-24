import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { company } from '../lib/company';

export function CompanyHeader() {
  return <header className="company-header"><Link href="/" aria-label="Baraabar home"><Image src="/brand/baraabar-icon.webp" alt="Baraabar" width={48} height={43} priority/></Link><nav aria-label="Company navigation"><Link href="/about">About us</Link><Link href="/contact">Contact us</Link><a className="company-call" href={company.phoneHref}><Phone size={16}/>Call Now</a></nav></header>;
}
export function ContactDetails() {
  return <div className="company-contact-details"><a href={company.phoneHref}><Phone size={20}/><span><small>Call us</small>{company.phone}</span></a><a href={`mailto:${company.email}`}><Mail size={20}/><span><small>Email us</small>{company.email}</span></a><a href={company.mapHref} target="_blank" rel="noopener noreferrer"><MapPin size={20}/><span><small>Our address</small>{company.address}</span></a></div>;
}
export function CompanyFooter() {
  return <footer className="company-footer"><div className="company-footer-grid"><div><Link href="/" aria-label="Baraabar home"><Image className="company-footer-logo" src="/brand/baraabar-logo.webp" alt="Baraabar — Appliances & Electronics Repairs" width={260} height={53}/></Link><p>Washing machine repair and care.<br/>A clearer next step for your home.</p></div><div className="company-footer-links"><h3>Explore Baraabar</h3><Link href="/#services">Our services</Link><Link href="/about">About us</Link><Link href="/contact">Contact us</Link><Link href="/#faq">Frequently asked questions</Link></div><div><h3>Get in touch</h3><ContactDetails/></div></div><div className="company-footer-bottom"><span>© {new Date().getFullYear()} Baraabar. All rights reserved.</span><div><Link href="/terms-and-conditions">Terms &amp; Conditions</Link><Link href="/privacy-policy">Privacy Policy</Link></div></div></footer>;
}
