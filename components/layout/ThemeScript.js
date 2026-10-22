'use client';
/* Applies the visitor's saved theme before first paint (inline in <head> of the server HTML).
   When React later renders the root layout in the browser (e.g. leaving a 404 page) the script must not run
   again and React warns about executable scripts it creates, so on the client it becomes an inert data block;
   the theme is already applied and kept by UIProvider. */
const THEME_SCRIPT = "try{var t=localStorage.getItem('tp_theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}";

export default function ThemeScript() {
  return <script suppressHydrationWarning type={typeof window === 'undefined' ? undefined : 'text/plain'} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
