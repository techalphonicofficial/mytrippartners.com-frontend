'use client';
/* The original's route() wrapper (polish.js) set decoding="async" on every #app image once a view had rendered.
   Shared cards (PkgCard, TallDest) don't render it, so the list views apply it after their first render. */
import { useEffect } from 'react';

export function useAsyncImages(deps = []) {
  useEffect(() => { document.querySelectorAll('#app img:not([decoding])').forEach(i => { i.decoding = 'async'; }); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
