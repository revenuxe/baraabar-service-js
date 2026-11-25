'use client';

import Image from 'next/image';
import { ServiceDropdown } from './service-dropdown';
import { useEffect, useRef, useState } from 'react';
import { services } from '../lib/services';
import { company } from '../lib/company';
import { useServiceSelection } from './service-selection';
import { Menu, Search, Phone, UserRound, ShoppingCart, BookOpen, Wrench, ChevronRight, CalendarDays, X, Check, MessageCircle } from 'lucide-react';



export function ServiceExperience({ location }: { location?: string }) {
  const [panel, setPanel] = useState<'account'|'cart'|'support'|null>(null);
  const [menu, setMenu] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    function outside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) setMenu(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') { setMenu(false); menuButton.current?.focus(); }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [menu]);
  const [serviceFilter, setServiceFilter] = useState('');
  const { selected, setSelected, setBookingOpen } = useServiceSelection();
  function addService(title: string) {
    if (!selected.includes(title)) setSelected([...selected, title]);
    setBookingOpen(true);
  }
  const matchingServices = serviceFilter ? services.filter(service => service.title === serviceFilter) : services;
  return <>
    <section className="service-intro" id="home">
      <header className="service-header" ref={header}>
        <div className="utility-row"><a className="header-icon-logo" href="#home" aria-label="Baraabar home"><Image src="/brand/baraabar-icon.webp" alt="Baraabar" width={770} height={689} priority/></a><div><a href="/contact">Contact us</a><a className="support-pill call-now" href={company.phoneHref}><Phone size={14}/>Call Now</a></div></div>
        <nav className="main-header" aria-label="Main navigation"><button className="round-control" ref={menuButton} aria-controls={menu ? "header-navigation" : undefined} aria-label={menu?'Close menu':'Open menu'} onClick={()=>setMenu(!menu)} aria-expanded={menu}>{menu?<X size={21}/>:<Menu size={21}/>}</button><div className="header-actions"><a className="round-control" href="#issue-search" aria-label="Search services" onClick={()=>setMenu(false)}><Search size={20}/></a><button className="round-control" aria-label="Account information" onClick={()=>{setMenu(false);setPanel('account')}}><UserRound size={20}/></button><button className="round-control cart-control" aria-label={`Service list, ${selected.length} selected`} onClick={()=>{setMenu(false);setPanel('cart')}}><ShoppingCart size={20}/>{selected.length>0&&<span>{selected.length}</span>}</button></div></nav>
        {menu&&<div className="header-dropdown" id="header-navigation">{[['Washing machine services','#services'],['Repair process','#why-us'],['Care guides','#resources'],['Frequently asked questions','#faq'],['About us','/about'],['Contact us','/contact'],['Terms & Conditions','/terms-and-conditions'],['Privacy Policy','/privacy-policy']].map(([label,href])=><a key={href} href={href} onClick={()=>setMenu(false)}>{label}<ChevronRight size={16}/></a>)}</div>}
      </header>
      <div className="support-content"><h1>{location ? `Washing Machine Repair in ${location}` : "Washing Machine Repair Services"}</h1><p className="intro-tagline">{location ? "Bengaluru washer repair, installation & care. Checkups from \u20B9199." : "Always at your service"}</p><ServiceDropdown value={serviceFilter} onChange={setServiceFilter}/>{serviceFilter && <div className="service-picker-status" role="status"><a href="#services">View selected service</a><button type="button" onClick={()=>setServiceFilter('')}>Show all services</button></div>}

      </div>
    </section>
    <section className="service-catalog" id="services"><div className="catalog-card"><div className="catalog-banner repair-poster"><div className="poster-copy"><h2>Washing Machine<br/>Checkup &amp; Repair</h2><p>Not spinning, draining, or completing a cycle? Start with a checkup for your front-load, top-load, or semi-automatic machine.</p><div className="poster-actions"><a href="#service-checkup">Explore the checkup</a><span>From <strong>&#8377;199</strong></span></div><div className="poster-bottom"><Check size={15}/> Repair estimate before you decide</div></div><img src="/services/washer-diagnosis.webp" alt="Illustrative image of a technician diagnosing a washing machine" fetchPriority="high"/></div><div className="catalog-body"><h2 className={location ? "location-catalog-title" : undefined}>Washing Machine Services{location ? ` in ${location}` : ""}</h2><p className="catalog-description">Repair, installation & maintenance</p><div className="catalog-services">{matchingServices.map(service=>{const added=selected.includes(service.title);return <article className="catalog-service" id={service.title === 'Automatic Top Load Machine Checkup' ? 'service-checkup' : undefined} key={service.title}><div className="catalog-service-copy"><h3>{service.title}</h3><p className="service-price">{service.starting && <span>Starts at </span>}<strong>{new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR', maximumFractionDigits: 0}).format(service.price)}</strong></p>{service.points.length > 0 && <ul>{service.points.map(point=><li key={point}>{point}</li>)}</ul>}<details><summary>View details <ChevronRight size={17}/></summary><p>{service.detail}</p></details></div><div className="service-thumbnail"><img src={service.image} alt={service.title} loading="lazy"/><button className={added?'is-added':''} aria-pressed={added} onClick={()=>addService(service.title)}>{added?<><Check size={15}/> Added</>:'Add'}</button></div></article>})}</div><p className="catalog-footnote">Prices cover the listed service scope. Spare parts and additional repairs are quoted separately; confirm the final amount before booking.</p></div></div></section>
    <section className="support-followup" aria-label="Washing machine help">      <div className="help-carousel" aria-label="Washing machine support options"><article className="quick-card"><h2>Quick Help</h2><p>From everyday care to troubleshooting tips — find a helpful next step for your washing machine.</p><div className="quick-links"><a href="#resources"><BookOpen size={25}/><span>Care guides</span><ChevronRight size={17}/></a><a href="#faq"><Wrench size={25}/><span>Troubleshooting</span><ChevronRight size={17}/></a></div></article><article className="quick-card"><h2>Service & Repair</h2><p>A washer that will not spin or drain? Explore repair options and start a service enquiry.</p><div className="quick-links"><a href="#services"><Wrench size={25}/><span>Explore services</span><ChevronRight size={17}/></a><a href="#contact-form"><CalendarDays size={25}/><span>Request a visit</span><ChevronRight size={17}/></a></div></article><article className="quick-card"><h2>Machine Care</h2><p>Small care habits make wash day easier. Get guidance for your machine and routine.</p><div className="quick-links"><a href="#resources"><BookOpen size={25}/><span>Maintenance tips</span><ChevronRight size={17}/></a><a href="#why-us"><MessageCircle size={25}/><span>How we can help</span><ChevronRight size={17}/></a></div></article></div></section>
    {panel&&<div className="service-modal-backdrop" onClick={()=>setPanel(null)}><section className="service-modal" role="dialog" aria-modal="true" aria-labelledby="panel-title" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setPanel(null)} aria-label="Close dialog" autoFocus><X/></button><h2 id="panel-title">{panel==='cart'?'Your service list':panel==='support'?'How can we help?':'Your service enquiries'}</h2>{panel==='cart'?<>{selected.length?<ul>{selected.map(s=><li key={s}><span>{s}<strong className="cart-price">{new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR', maximumFractionDigits: 0}).format(services.find(service=>service.title===s)!.price)}</strong></span><button onClick={()=>setSelected(selected.filter(x=>x!==s))} aria-label={`Remove ${s}`}><X size={16}/></button></li>)}</ul>:<p>No services selected yet. Add a washing machine service to build your enquiry.</p>}<a className="modal-action" href={selected.length?'#contact-form':'#services'} onClick={()=>setPanel(null)}>{selected.length?'Continue to service enquiry':'Explore services'}</a><small>Your selected services are ready for an enquiry. No payment has been made.</small></>:<><p>{panel==='support'?'Find washing machine care advice, answers to common faults, or request help from the service team.':'Start with a service enquiry. Online accounts and booking history are not connected in this preview.'}</p><a className="modal-action" href="#contact-form" onClick={()=>setPanel(null)}>Request service help</a><a className="modal-secondary" href="#faq" onClick={()=>setPanel(null)}>Read frequently asked questions</a></>}</section></div>}
  </>;
}
