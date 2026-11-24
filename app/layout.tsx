import type { Metadata } from 'next';
import './globals.css';
import { BookingOverlay } from './booking-overlay';
import { ServiceSelectionProvider } from './service-selection';

export const metadata: Metadata = {
  title: 'Washing Machine Repair | Baraabar',
  icons: { icon: '/brand/baraabar-icon.webp' },
  description: 'Washing machine not spinning, draining, or finishing its cycle? Explore Baraabar washer repair options, common faults, and care tips for front-load, top-load, and semi-automatic machines.',
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><ServiceSelectionProvider>{children}<BookingOverlay/></ServiceSelectionProvider></body></html>;
}
