/* Page frame of the payment pages (original payproof.js payShell): crumbs, heading, trust points. */
import Link from 'next/link';
import { I } from '@/components/icons';
import { VIEW_PATHS } from '@/lib/routes';

export default function PayShell({ crumb, tat, children }) {
  return (
    <>
      <section className="bk-top py-top"><div className="wrap"><nav className="crumbs dark"><Link href="/">Home</Link><span>/</span><Link href={VIEW_PATHS.account}>My Trips</Link><span>/</span><span>{crumb}</span></nav>
        <div className="py-hd"><div><span className="eyebrow">Secure payment</span><h1>{crumb === 'Receipt' ? 'Payment receipt' : 'Pay & upload payment proof'}</h1></div>
          <ul className="py-trust"><li>{I.shield} Pay only to TripPartner’s official account</li><li>{I.check} Verified by our accounts team</li><li>{I.clock} Receipt within {tat}</li></ul></div></div></section>
      <section className="sec-tight py-sec"><div className="wrap">{children}</div></section>
    </>
  );
}
