'use client';
/* React hooks over the per-device stores and the browser copy of the website data. */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { wishlist, compare, recent, deviceDB } from './storage';
import { loadSite } from './api';
import { createStore as createSiteStore } from '../store';

/* value of a storage store; the server render and first client render use the empty value (no hydration mismatch) */
export const useStoreValue = store => useSyncExternalStore(store.subscribe, store.get, store.serverSnapshot);

export const useWishlist = () => useStoreValue(wishlist);
export const useCompare = () => useStoreValue(compare);
export const useRecent = () => useStoreValue(recent);
export const useDeviceDB = () => useStoreValue(deviceDB);

/* full site store in the browser (null until loaded) — for search, compare, wishlist, planner … */
let siteStore = null;
export function useSite() {
  const [S, setS] = useState(siteStore);
  useEffect(() => {
    if (siteStore) return;
    let live = true;
    loadSite().then(d => { siteStore = siteStore || createSiteStore(d); if (live) setS(siteStore); }).catch(() => {});
    return () => { live = false; };
  }, []);
  return S;
}

/* true after hydration (for UI that depends on device-only state) */
export function useMounted() { const [m, setM] = useState(false); useEffect(() => setM(true), []); return m; }
