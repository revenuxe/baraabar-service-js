import type { Metadata } from 'next';
import { siteUrl } from './site';

// One source for page titles, search snippets, social previews and schema names.
export const publicPages = {
  '/': { title: 'Washing Machine Repair & Service | Baraabar', description: 'Explore Baraabar washing machine checkups from ₹199, installation, descaling and deep cleaning. Compare service prices and request help in Bengaluru.', name: 'Washing machine repair and service', type: 'WebPage' },
  '/washing-machine-repair-bangalore': { title: 'Washing Machine Repair in Bangalore | Baraabar', description: 'Book a washing machine checkup from ₹199 in Bangalore. Front-load, top-load and semi-automatic diagnosis, installation and cleaning. Confirm your PIN code.', name: 'Washing machine repair in Bangalore', type: 'WebPage' },
  '/about': { title: 'About Baraabar | Washing Machine Service, Bengaluru', description: 'Meet Baraabar, based in Glass factory, Bengaluru. Learn about our washing machine diagnosis, repair estimates, installation and maintenance approach.', name: 'About Baraabar', type: 'AboutPage' },
  '/contact': { title: 'Contact Baraabar | Washing Machine Repair, Bengaluru', description: 'Call +91 9886285028 or request washing machine service with Baraabar in Bengaluru. Find our Glass factory address and confirm availability for your PIN code.', name: 'Contact Baraabar', type: 'ContactPage' },
  '/privacy-policy': { title: 'Privacy Policy | Baraabar', description: 'Read how Baraabar handles service enquiry details, browser storage, data sharing and retention, and how to contact us about your privacy.', name: 'Privacy policy', type: 'WebPage' },
  '/terms-and-conditions': { title: 'Service Terms & Conditions | Baraabar', description: 'Review Baraabar service terms covering washing machine checkups, repair estimates, parts, appointments, cancellations, warranties and complaints.', name: 'Terms and conditions', type: 'WebPage' },
} as const;
export type PublicPath = keyof typeof publicPages;

export function pageMetadata(path: PublicPath): Metadata {
  const { title, description } = publicPages[path];
  const url = siteUrl ? `${siteUrl}${path}` : undefined;
  const images = siteUrl ? [{ url: `${siteUrl}/services/washer-diagnosis.webp`, alt: 'Illustrative washing machine diagnosis scene' }] : undefined;
  return {
    title, description,
    alternates: url ? { canonical: url } : undefined,
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { title, description, url, type: 'website', locale: 'en_IN', siteName: 'Baraabar', images },
    twitter: { card: 'summary_large_image', title, description, images: images?.map(image => image.url) },
  };
}
