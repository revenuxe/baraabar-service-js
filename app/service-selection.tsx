'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { services } from '../lib/services';

const SelectionContext = createContext<{ selected: string[]; setSelected: (value: string[]) => void; bookingOpen: boolean; setBookingOpen: (open: boolean) => void }>({selected: [], setSelected: () => {}, bookingOpen: false, setBookingOpen: () => {}});
export function ServiceSelectionProvider({children}: {children: ReactNode}) {
  const [selected, updateSelected] = useState<string[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem('baraabar-services') || '[]');
      if (Array.isArray(saved)) updateSelected(saved.filter((s): s is string => typeof s === 'string' && services.some(service => service.title === s)));
    } catch { /* Storage can be disabled. Selection still works in memory. */ }
  }, []);
  function setSelected(value: string[]) {
    updateSelected(value);
    try { sessionStorage.setItem('baraabar-services', JSON.stringify(value)); } catch {}
  }
  return <SelectionContext.Provider value={{ selected, setSelected, bookingOpen, setBookingOpen }}>{children}</SelectionContext.Provider>;
}
export const useServiceSelection = () => useContext(SelectionContext);
