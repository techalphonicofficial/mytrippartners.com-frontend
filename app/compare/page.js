/* Compare packages (legacy improve.js comparePage) */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import CompareView from '@/components/catalogue/lists/CompareView';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, '/compare/', 'Compare Packages'); }

export default function Page() {
  return (
    <>
      <section className="page-hero"><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>Compare</span></nav><h1>Compare packages</h1><p className="lead">Side-by-side view of price, duration, stays, meals and pace. Add up to 3 packages with “+ Compare” on any package card.</p></div><div></div></div></section>
      <CompareView />
    </>
  );
}
