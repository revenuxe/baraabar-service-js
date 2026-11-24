import { CompanyFooter } from './company-components';
import { ContactForm } from './contact-form';
import { ServiceExperience } from './service-experience';
import Image from 'next/image';
import { BadgeCheck, Check, Clock3, Wrench, ShieldCheck, Phone, MapPin, Menu, Droplets, WashingMachine, Settings2, Plus, Facebook, Instagram, Youtube } from 'lucide-react';
import { Newsletter, Booking } from './widgets';

export const dynamic = 'force-dynamic';
const photos = {
 hero: '/services/washer-diagnosis.webp',
 laundry: '/services/washer-diagnosis.webp',
 detail: '/services/washer-disconnection.webp',
};
const faqs = [
 ['Which washing machines can I request a repair for?', 'Tell us whether your machine is front-loading, top-loading, or semi-automatic. Include the brand, model, and symptoms so the team can confirm service availability for your machine.'],
 ['My washing machine will not drain. What should I do?', 'Pause the cycle and consult your model’s manual. Avoid forcing the door open when water is visible. Share any error code with your technician so they can assess the drainage problem.'],
 ['How much will my washing machine repair cost?', 'The cost depends on the diagnosis, parts, and work needed. Request an assessment and ask for a breakdown before approving any repair.'],
 ['Should I repair or replace my washing machine?', 'Consider its age, condition, repair estimate, and history of faults. A diagnosis helps you compare a repair with the cost and practical benefits of a replacement.'],
 ['What information should I have ready?', 'Have your machine’s brand, model number, approximate age, and error code ready. Describe when the fault happens and whether you have noticed leaking, unusual noise, or incomplete cycles.'],
];
function Brand({ full = false }: { full?: boolean }) { return <a className={full ? 'brand brand-full' : 'brand brand-icon'} href="#home" aria-label="Baraabar home"><Image src={full ? '/brand/baraabar-logo.webp' : '/brand/baraabar-icon.webp'} alt={full ? 'Baraabar — Appliances & Electronics Repairs' : 'Baraabar'} width={full ? 1673 : 770} height={full ? 341 : 689} priority={!full} /></a> }
export default function Home() {
 return <>
  <main>
   <ServiceExperience/>
   <section className="find-banner section" id="book"><div><span className="eyebrow light">HELP IS CLOSER THAN YOU THINK</span><h2>Request Washing Machine<br/>Repair in Your Area</h2><p>Tell us which service you need and leave your contact details.</p><a className="button white" href="#contact-form">Request service</a></div></section>
   <section className="section why" id="why-us"><div><span className="eyebrow">SERVICE YOU CAN FEEL GOOD ABOUT</span><h2>Why Choose Baraabar for<br/><em>Washing Machine Repair?</em></h2><p>Washing machine repair should begin with clear answers.</p><div className="benefits"><details open><summary><span className="icon-circle"><BadgeCheck/></span>Start with the symptoms<Plus size={17}/></summary><p>Share the model, the error code, and what happens during the cycle. These details help guide a washing machine assessment.</p></details><details><summary><span className="icon-circle"><Clock3/></span>Understand the next step<Plus size={17}/></summary><p>Confirm local availability and appointment details with the service team before arranging a visit.</p></details><details><summary><span className="icon-circle"><ShieldCheck/></span>Review your repair options<Plus size={17}/></summary><p>Ask what caused the fault, which parts may be needed, and what the work will cost before you decide.</p></details></div></div><div className="why-photo"><img src="/services/service-professional.webp" alt="Illustrative image of a washing machine service professional" loading="lazy"/><span className="photo-label"><ShieldCheck/> A fresh start for laundry day.</span></div></section>
   <section className="section resources" id="resources"><div className="split-heading"><div><span className="eyebrow">A LITTLE KNOW-HOW GOES A LONG WAY</span><h2>Washing Machine<br/><em>Maintenance & Care Tips</em></h2></div><p>Simple habits, useful checks, and clearer decisions for the washing machine you use every week.</p></div><div className="resource-grid">{[{title:'A cleaner washer. A fresher load.',photo:'/services/care-seal.webp',tag:'WASHER CARE',body:'Use the detergent type and dose recommended for your model. Follow its drum-clean instructions and wipe accessible seals as directed in the manual.'},{title:'Before you book a washer repair',photo:'/services/care-error.webp',tag:'EXPERT ADVICE',body:'Note any error code and check the selected cycle and load against your user manual. Do not force a locked door or dismantle the machine. Share the symptoms when requesting service.'},{title:'Repair or replace your washing machine?',photo:'/services/care-replace.webp',tag:'HELPFUL GUIDES',body:'Compare your washer’s age, condition, repair estimate, and frequency of faults. Ask what the diagnosis means for future reliability before choosing a repair or a new machine.'}].map(r=><details className="care-guide" key={r.title}><summary><img src={r.photo} alt="" loading="lazy"/><div><span>{r.tag}</span><h3>{r.title}</h3><span className="read-guide">Read the guide +</span></div></summary><p>{r.body}</p></details>)}</div><a href="#faq" className="button dark resource-button">More helpful answers <Plus size={15}/></a></section>
   <section className="section faq" id="faq"><div className="faq-list">{faqs.map(([q,a],i)=><details key={q} open={i===0}><summary>{q}<span><Plus size={17}/></span></summary><p>{a}</p></details>)}</div><aside><span className="eyebrow">LET’S CLEAR THINGS UP</span><h2>Washing Machine Repair<br/><em>Frequently Asked Questions</em></h2><p>From a stuck cycle to repair costs,<br/>here’s a helpful place to start.</p><a className="button blue" href="#contact-form">Request service <Wrench size={15}/></a><div className="help-card"><span className="icon-circle"><Phone size={19}/></span><div><strong>Need a little extra help?</strong><p>Connect with your local team.</p><a href="tel:+919886285028">Call +91 9886285028</a></div></div></aside></section>
   <section className="washer-care-section section"><div><h2>Keep Your Washing Machine<br/>Running Better</h2><p>From a quick checkup to deep cleaning, find the right care for your machine. Choose a service and we’ll help with the next step.</p></div><a className="button dark" href="#contact-form">Request washing machine service <Wrench size={16}/></a></section>
   <ContactForm/>
  </main>
  <CompanyFooter/>
 </>;
}
