'use client';
/* =====================================================================
   Global UI services for client components:
     const ui = useUI();
     ui.toast('Saved to wishlist')
     ui.openModal(<Body/>, 'Title', 'Subtitle')   ui.closeModal()
     ui.theme.toggle()   ui.theme.dark
     ui.drawer.open / ui.drawer.setOpen(bool)          mobile menu
     ui.register('planner', fn) → unregister            a feature makes itself openable by name
     ui.open('planner', 'Goa')                           open a feature (planner, search, quickfind, lightbox, reel …)
   Renders the modal and toast with the original markup (#modal, #toast) so the existing CSS applies.
   ===================================================================== */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { flush } from '@/lib/client/api';
import { usePathname } from 'next/navigation';

const UIContext = createContext(null);
export const useUI = () => useContext(UIContext);

function readTheme() { try { return localStorage.getItem('tp_theme'); } catch (e) { return null; } }

export default function UIProvider({ children }) {
  const [modal, setModal] = useState(null);           /* { body, title, sub } */
  const [toastMsg, setToastMsg] = useState({ text: '', on: false });
  const [theme, setTheme] = useState(null);            /* 'dark' | 'light' | null (system) */
  const [sysDark, setSysDark] = useState(false);       /* system preference, read after mount */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const lastFocus = useRef(null), toastTimer = useRef(null), bodyRef = useRef(null), features = useRef(new Map());
  const register = useCallback((name, fn) => { features.current.set(name, fn); return () => { if (features.current.get(name) === fn) features.current.delete(name); }; }, []);
  const open = useCallback((name, ...args) => { const fn = features.current.get(name); if (fn) fn(...args); else if (process.env.NODE_ENV !== 'production') console.warn('UI feature not registered:', name); }, []);

  const toast = useCallback(text => {
    setToastMsg({ text, on: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(t => ({ ...t, on: false })), 2200);
  }, []);
  const openModal = useCallback((body, title = '', sub = '') => {
    setModal(m => { if (!m) lastFocus.current = document.activeElement; return { body, title, sub }; });
  }, []);
  const closeModal = useCallback(() => setModal(m => { if (m && lastFocus.current && document.body.contains(lastFocus.current)) setTimeout(() => lastFocus.current.focus(), 0); return null; }), []);

  /* a modal belongs to the page it was opened on: close it when the visitor navigates */
  const path = usePathname();
  useEffect(() => { setModal(null); }, [path]);

  /* body scroll lock + focus first field when the modal opens */
  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : '';
    if (modal) setTimeout(() => { const f = bodyRef.current && bodyRef.current.querySelector('input,button'); f && f.focus(); }, 30);
  }, [modal]);

  /* Escape closes, Tab is trapped inside the modal */
  useEffect(() => {
    if (!modal) return;
    const onKey = e => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Tab') {
        const root = document.getElementById('modal'); if (!root) return;
        const f = [...root.querySelectorAll('button,a[href],input,select,textarea')].filter(x => !x.disabled && x.offsetParent);
        if (!f.length) return; const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modal, closeModal]);

  /* theme: stored choice or system preference (the inline script in the layout applies it before paint) */
  useEffect(() => {
    const saved = readTheme(); setTheme(saved); flush();
    /* normally already applied by ThemeScript; not on pages Next renders in the browser (404 from notFound()) */
    if (saved && document.documentElement.getAttribute('data-theme') !== saved) document.documentElement.setAttribute('data-theme', saved);
    const mq = window.matchMedia('(prefers-color-scheme: dark)'); setSysDark(mq.matches);
    const on = e => setSysDark(e.matches); mq.addEventListener && mq.addEventListener('change', on);
    return () => mq.removeEventListener && mq.removeEventListener('change', on);
  }, []);
  const applyTheme = useCallback(t => {
    const r = document.documentElement; if (t) r.setAttribute('data-theme', t); else r.removeAttribute('data-theme');
    try { localStorage.setItem('tp_theme', t); } catch (e) { /* private mode */ }
    setTheme(t);
  }, []);
  const dark = theme ? theme === 'dark' : sysDark;
  const toggleTheme = useCallback(() => { const nt = dark ? 'light' : 'dark'; applyTheme(nt); toast(nt === 'dark' ? 'Dark mode on' : 'Light mode on'); }, [dark, applyTheme, toast]);

  const value = useMemo(() => ({ toast, openModal, closeModal, modalOpen: !!modal, theme: { dark, toggle: toggleTheme }, drawer: { open: drawerOpen, setOpen: setDrawerOpen }, register, open }),
    [toast, openModal, closeModal, modal, dark, toggleTheme, drawerOpen, register, open]);

  return (
    <UIContext.Provider value={value}>
      {children}
      <div className="modal" id="modal" hidden={!modal}>
        <div className="scrim" onClick={closeModal}></div>
        <div className="dlg" role="dialog" aria-modal="true" aria-labelledby="mtitle">
          <div className="dlg-h"><div><h3 id="mtitle">{modal ? modal.title : ''}</h3><small id="msub">{modal ? modal.sub : ''}</small></div><button className="x" onClick={closeModal} aria-label="Close">×</button></div>
          <div className="dlg-b" id="mbody" ref={bodyRef}>{modal ? modal.body : null}</div>
        </div>
      </div>
      <div className={'toast' + (toastMsg.on ? ' on' : '')} id="toast" role="status">{toastMsg.text}</div>
    </UIContext.Provider>
  );
}
