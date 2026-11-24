'use client';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { services } from '../lib/services';

export function ServiceDropdown({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) { if (!root.current?.contains(event.target as Node)) setOpen(false); }
    document.addEventListener('pointerdown', outside);
    const active = root.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    active?.focus({preventScroll:true});
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  function choose(title: string) { onChange(title); setOpen(false); trigger.current?.focus({preventScroll:true}); }
  function keyboard(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
    if (event.key === 'Tab') setOpen(false);
    const options = [...(root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') || [])];
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (event.key === 'ArrowDown') next = (index + 1) % options.length;
    if (event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = options.length - 1;
    if (next >= 0) { event.preventDefault(); options[next]?.focus(); }
  }
  return <div className="custom-service-picker" id="issue-search" ref={root} onKeyDown={keyboard}>
    <button className="service-picker-trigger" ref={trigger} type="button" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? 'service-options' : undefined} onClick={()=>setOpen(!open)} onKeyDown={e=>{if(!open && ['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();setOpen(true)}}}><Search size={23} aria-hidden="true"/><span>{value || 'Select a service'}</span><ChevronDown size={19} className={open?'is-open':''} aria-hidden="true"/></button>
    {open && <div className="service-options-panel"><div className="service-options-heading">Choose your service<span>{services.length} available</span></div><div id="service-options" role="listbox" aria-label="Washing machine services"><button type="button" role="option" aria-selected={!value} onClick={()=>choose('')}><span className="option-copy">All washing machine services</span>{!value && <Check size={17}/>}</button>{services.map(service=><button type="button" role="option" aria-selected={value === service.title} key={service.title} onClick={()=>choose(service.title)}><img src={service.image} alt=""/><span className="option-copy">{service.title}<small>{service.starting ? 'From ' : ''}{'\u20B9'}{service.price}</small></span>{value === service.title && <Check size={17}/>}</button>)}</div></div>}
  </div>;
}
