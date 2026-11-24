'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useServiceSelection } from './service-selection';
import { ContactForm } from './contact-form';

export function BookingOverlay() {
  const { bookingOpen, setBookingOpen } = useServiceSelection();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!bookingOpen || !dialog) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => { dialog.close(); document.body.style.overflow = overflow; };
  }, [bookingOpen]);
  return <dialog className="booking-screen" ref={ref} aria-labelledby="booking-screen-title" onCancel={event=>{event.preventDefault();setBookingOpen(false)}}>
    {bookingOpen && <><header className="booking-screen-header"><div><h2 id="booking-screen-title">Request service</h2><p>Just a few details to get started.</p></div><button type="button" aria-label="Close service form" autoFocus onClick={()=>setBookingOpen(false)}><X size={23}/></button></header><ContactForm compact/></>}
  </dialog>;
}
