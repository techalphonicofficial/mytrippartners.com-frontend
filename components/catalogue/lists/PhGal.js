'use client';
/* Page-hero photo gallery (.ph-gal): clicking a photo opens the lightbox at that photo (legacy improveClick '.ph-gal img'). */
import { useUI } from '@/components/providers/UIProvider';

export default function PhGal({ className = 'ph-gal', srcs }) {
  const ui = useUI();
  const onClick = e => {
    const g = e.target.closest('img'); if (!g) return;
    const list = [...e.currentTarget.querySelectorAll('img')];
    ui.open('lightbox', list.map(i => ({ src: i.src, alt: i.alt })), list.indexOf(g));
  };
  return <div className={className} onClick={onClick}>{srcs.map((s, i) => <img key={i} src={s} alt="" decoding="async" />)}</div>;
}
