'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Send, X, Smile } from 'lucide-react';
import { company } from '../lib/company';
import { useServiceSelection } from './service-selection';

const storageKey = 'baraabar-whatsapp-prompt-seen';

function ChatBotIcon() {
  return <svg className="wa-bot-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M32 4C16.5 4 4 15.6 4 30c0 6.4 2.5 12.3 6.7 16.9L7 59l13.7-5.6A30 30 0 0 0 32 56c15.5 0 28-11.6 28-26S47.5 4 32 4Z" fill="currentColor" stroke="#fff" strokeWidth="2"/><path d="M32 5C17 5 5 16.2 5 30c0 6.4 2.5 12.3 6.8 16.7L8.6 57l12.2-5A29 29 0 0 0 32 54.7c15 0 27-11 27-24.7S47 5 32 5Z" stroke="#ffffff70" strokeWidth="1.3"/><rect x="16" y="21" width="32" height="21" rx="7" stroke="#fff" strokeWidth="2.8"/><path d="M12 28v7m40-7v7" stroke="#fff" strokeWidth="2.8" strokeLinecap="round"/><circle cx="25" cy="31" r="2" fill="#fff"/><circle cx="39" cy="31" r="2" fill="#fff"/><path d="M28 36c2.5 1.5 5.5 1.5 8 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

export function WhatsAppChat() {
  const pathname = usePathname();
  const { bookingOpen } = useServiceSelection();
  const [open, setOpen] = useState(false);
  const [serviceVisibility, setServiceVisibility] = useState({ path: '', visible: false });
  const launcher = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const admin = pathname.startsWith('/admin');
  const landing = pathname === '/' || pathname === '/washing-machine-repair-bangalore';
  const visible = !landing || (serviceVisibility.path === pathname && serviceVisibility.visible);
  const href = `https://wa.me/${company.phoneHref.replace(/\D/g, '')}?text=${encodeURIComponent('Hi Baraabar! I need help with my washing machine in Bengaluru.')}`;

  function markSeen() {
    if (timer.current) clearTimeout(timer.current);
    try { sessionStorage.setItem(storageKey, '1'); } catch { /* Chat still works when storage is unavailable. */ }
  }
  function close() { markSeen(); setOpen(false); }

  useEffect(() => {
    if (!landing) return;
    const services = document.querySelector('.catalog-body');
    if (!services) return;
    let frame = 0;
    function update() {
      frame = 0;
      const reached = services!.getBoundingClientRect().top <= window.innerHeight - 80;
      setServiceVisibility(previous => previous.path === pathname && previous.visible === reached ? previous : { path: pathname, visible: reached });
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [landing, pathname]);

  useEffect(() => {
    if (admin || bookingOpen || !visible) return;
    try { if (sessionStorage.getItem(storageKey)) return; } catch {}
    timer.current = setTimeout(() => {
      setOpen(true);
      try { sessionStorage.setItem(storageKey, '1'); } catch {}
    }, 4000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [admin, bookingOpen, visible]);

  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); launcher.current?.focus(); }
    }
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);

  if (admin || bookingOpen || !visible) return null;
  return <div className="wa-widget">
    {open && <section className="wa-panel" id="whatsapp-chat" role="region" aria-labelledby="wa-title">
      <header className="wa-header"><span className="wa-avatar"><img src="/brand/whatsapp.svg" alt="WhatsApp" width={30} height={30}/></span><div><h2 id="wa-title">Baraabar</h2><p>Typically replies on WhatsApp</p></div><button type="button" onClick={close} aria-label="Close WhatsApp chat"><X size={20}/></button></header>
      <div className="wa-conversation"><div className="wa-bubble"><span className="wa-sender">Baraabar Support</span><strong>Hi there! How can we help?</strong><p>Tell us your washing machine issue and Bengaluru PIN code.</p></div></div>
      <a className="wa-composer" href={href} target="_blank" rel="noopener noreferrer" aria-label="Type a message on WhatsApp (opens in a new tab)" onClick={markSeen}><span className="wa-input"><Smile size={20}/><span>Type a message…</span></span><span className="wa-send"><Send size={18}/></span></a>
      <p className="wa-footer-note">Opens WhatsApp · Reply times may vary</p>
    </section>}
    <button ref={launcher} type="button" className="wa-launcher" aria-label={open ? 'Close WhatsApp chat' : 'Open WhatsApp chat'} aria-expanded={open} aria-controls={open ? 'whatsapp-chat' : undefined} onClick={() => { markSeen(); setOpen(!open); }}><ChatBotIcon/><span className="wa-launcher-label">Let’s chat</span></button>
  </div>;
}
