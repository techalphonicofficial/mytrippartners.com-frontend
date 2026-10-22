'use client';
/* Floating compare tray (legacy improve.js drawTray): the packages picked with "+ Compare", remove / clear,
   and a link to the compare page. Hidden when nothing is selected and on the compare page itself. */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCompare, useSite } from '@/lib/client/hooks';
import { CMP } from '@/lib/client/storage';
import { img } from '@/lib/format';
import { VIEW_PATHS } from '@/lib/routes';

export default function CompareTray() {
  const ids = useCompare(), S = useSite(), path = usePathname();
  const a = S ? ids.map(S.P).filter(Boolean) : [];
  const hidden = !a.length || path === VIEW_PATHS.compare;
  return (
    <div className="cmptray" id="cmptray" hidden={hidden} aria-label="Packages to compare">
      {hidden ? null : <>
        <span className="ct-count">{a.length} selected</span>
        <div className="ct-items">{a.map(p => <span key={p.id}><img src={img(p.img)} alt="" />{p.title}<button type="button" aria-label={`Remove ${p.title}`} onClick={() => CMP.toggle(p.id)}>×</button></span>)}</div>
        <div className="ct-act"><button type="button" className="btn btn-ghost btn-sm" onClick={() => CMP.clear()}>Clear</button><Link className="btn btn-o btn-sm" href={VIEW_PATHS.compare}>Compare {a.length}</Link></div>
      </>}
    </div>
  );
}
