'use client';
import { useState, type FormEvent } from 'react';
import { CheckCircle2, X, LoaderCircle } from 'lucide-react';
import { useServiceSelection } from './service-selection';
import { services } from '../lib/services';

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const prefix = compact ? "booking" : "contact";
  const {selected, setSelected, setBookingOpen} = useServiceSelection();
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setStatus('sending'); setMessage('');
    try {
      const response = await fetch('/api/contact', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name: fields.get('name'), mobile: fields.get('mobile'), pincode: fields.get('pincode'), services: selected})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your request could not be sent. Please try again.');
      setReference(result.reference || ''); setStatus('success'); form.reset(); setSelected([]);
    } catch (error) { setStatus('error'); setMessage(error instanceof Error ? error.message : 'Unable to send. Please try again.'); }
  }
  return <section className={`contact-section section${compact ? " contact-compact" : ""}`} id={`${prefix}-form`} aria-labelledby={compact ? "booking-screen-title" : "contact-title"}>
    <div className="contact-intro"><h2 id="contact-title">Request Washing<br/>Machine Service</h2><p>Choose your service and leave your details so the team can help with your enquiry.</p><div className="contact-reassurance"><CheckCircle2 size={18}/><span>Review your repair estimate before approving work.</span></div></div>
    <div className="contact-form-card">
      {status === 'success' ? <div className="contact-success" role="status"><CheckCircle2 size={36}/><h3>Your enquiry has been sent.</h3><p>Thank you. The team has received your service request.</p>{reference && <p className="enquiry-reference">Reference: <strong>{reference}</strong></p>}<button type="button" onClick={()=>setStatus('idle')}>Send another enquiry</button></div> : <form onSubmit={submit}>
        <div className="selected-services"><h3>{selected.length ? 'Selected services' : 'General service enquiry'}</h3>{selected.length > 0 && <ul>{selected.map(title=><li key={title}><div><span>{title}</span><strong>{services.find(s=>s.title===title)?.starting ? 'From ' : ''}{'\u20B9'}{services.find(s=>s.title===title)?.price}</strong></div><button type="button" disabled={status==='sending'} aria-label={`Remove ${title}`} onClick={()=>setSelected(selected.filter(s=>s!==title))}><X size={15}/></button></li>)}</ul>}{compact ? <button className="change-service" type="button" onClick={()=>setBookingOpen(false)}>Change service</button> : <a href="/#services">{selected.length ? 'Add another service' : 'Browse services'}</a>}</div>
        <div className="contact-fields"><label htmlFor={`${prefix}-name`}>Name<input id={`${prefix}-name`} name="name" placeholder="Your full name" autoComplete="name" required minLength={2} maxLength={100} disabled={status==='sending'}/></label><label htmlFor={`${prefix}-mobile`}>Mobile number<input id={`${prefix}-mobile`} name="mobile" type="tel" inputMode="numeric" placeholder="10-digit mobile number" autoComplete="tel-national" pattern="[6-9][0-9]{9}" maxLength={10} required title="Enter a valid 10-digit Indian mobile number" disabled={status==='sending'}/></label><label htmlFor={`${prefix}-pin`}>PIN code<input id={`${prefix}-pin`} name="pincode" inputMode="numeric" placeholder="6-digit PIN code" autoComplete="postal-code" pattern="[1-9][0-9]{5}" maxLength={6} required title="Enter a valid 6-digit PIN code" disabled={status==='sending'}/></label></div>
        {status==='error' && <p className="contact-error" role="alert">{message}</p>}
        <button className="contact-submit" type="submit" disabled={status==='sending'}>{status==='sending'?<><LoaderCircle className="spin" size={17}/> Sending enquiry...</>:'Request service'}</button><p className="contact-note">No payment now. Spare parts and additional repairs are quoted separately.</p><p className="contact-policy-notice">By submitting, you ask Baraabar to contact you about this enquiry. Read our <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>.</p>
      </form>}
    </div>
  </section>;
}
