import type { Metadata } from 'next';
import { siteUrl } from '../lib/site';
import './globals.css';
import './whatsapp-chat.css';
import { BookingOverlay } from './booking-overlay';
import { ServiceSelectionProvider } from './service-selection';
import { WhatsAppChat } from './whatsapp-chat';

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: 'Washing Machine Repair | Baraabar',
  description: 'Washing machine not spinning, draining, or finishing its cycle? Explore Baraabar washer repair options, common faults, and care tips for front-load, top-load, and semi-automatic machines.',
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><ServiceSelectionProvider>{children}<BookingOverlay/><WhatsAppChat/></ServiceSelectionProvider></body></html>;
}
