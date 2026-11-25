import Link from 'next/link';
import { MapPin, Phone, ClipboardCheck, Wrench, Check } from 'lucide-react';
import { company } from '../lib/company';

export const bangaloreFaqs = [
  ['How do I book washing machine repair in Bangalore?', 'Choose a checkup or service from the catalogue and submit your contact details, PIN code, brand, and symptoms. Baraabar will confirm availability for your Bengaluru address and discuss the appointment.'],
  ['What does a washing machine checkup cost in Bangalore?', 'The listed front-load, top-load, and semi-automatic checkups cost ₹199. Spare parts and additional repair work are quoted separately after assessment. Confirm the final scope and amount before booking.'],
  ['Which Bangalore areas can I enquire about?', 'Baraabar is based in Glass factory on Nagawara Main Road, Bengaluru 560045. Send your area and PIN code to confirm whether a visit is available at your address; coverage and appointment slots are confirmed by the team.'],
  ['Can I request front-load and top-load washing machine service?', 'Yes. The catalogue includes automatic front-load, automatic top-load, and semi-automatic checkups. Share the brand and model so the team can confirm suitability and any parts requirements.'],
  ['Do you offer washing machine installation and cleaning in Bengaluru?', 'You can request installation, uninstallation, descaling, and deep cleaning as well as fault diagnosis. The scope depends on your machine, connections, and site conditions.'],
  ['Is same-day washing machine repair available in Bangalore?', 'Call to ask about the next available appointment. Timing depends on your PIN code, the schedule, and any parts needed; a same-day visit or completed repair is not guaranteed.'],
] as const;

export function BangaloreDetails() {
  return <section className="bangalore-local section" aria-labelledby="bangalore-heading">
    <nav className="local-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Washing machine repair in Bangalore</span></nav>
    <div className="local-heading"><div><span className="eyebrow">LOCAL CARE FOR LAUNDRY DAY</span><h2 id="bangalore-heading">Your washing machine.<br/><em>Your Bengaluru service team.</em></h2><p>A drum that will not spin, water that will not drain, or an interrupted wash cycle? Tell Baraabar what is happening and start with a diagnosis. Compare checkups, installation, and cleaning services below, with a local point of contact in Glass factory.</p><div className="local-actions"><a className="button blue" href="#services"><Wrench size={17}/>Choose a service</a><a className="button dark" href={company.phoneHref}><Phone size={17}/>Call Baraabar</a></div></div><aside className="local-address"><MapPin size={28}/><h3>Based in Bengaluru</h3><p>{company.address}</p><a href={company.mapHref} target="_blank" rel="noopener noreferrer">View our location on Google Maps</a><p>Share your area and PIN code to confirm service availability and the next appointment.</p></aside></div>
    <div className="local-steps">{[{Icon:ClipboardCheck,title:'Describe the fault',body:'Share your machine type, model, error code, and Bengaluru PIN code.'},{Icon:Wrench,title:'Start with a checkup',body:'Choose diagnosis, installation, or machine care from the catalogue above.'},{Icon:Check,title:'Approve the next step',body:'Review the diagnosis and any separate repair or parts estimate before work begins.'}].map(({Icon,title,body})=><article key={title}><Icon size={24}/><h3>{title}</h3><p>{body}</p></article>)}</div>
    <div className="local-faq"><span className="eyebrow">BANGALORE SERVICE QUESTIONS</span><h2>Before you request a visit</h2>{bangaloreFaqs.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
  </section>;
}
