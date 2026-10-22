'use client';
/* Saved packages on this device (legacy wishlistPage body). Updates live when a heart is toggled. */
import Link from 'next/link';
import { useSite, useWishlist } from '@/lib/client/hooks';
import { PkgCard } from '@/components/ui/cards';
import { VIEW_PATHS } from '@/lib/routes';
import { useAsyncImages } from './asyncImages';

export default function WishlistView() {
  const ids = useWishlist(), S = useSite();
  const items = S ? ids.map(S.P).filter(Boolean) : [];
  useAsyncImages([S]);
  return (
    <section className="sec"><div className="wrap">{items.length ? <div className="grid g3">{items.map(p => <PkgCard key={p.id} p={p} />)}</div>
      : <div className="empty"><h3>No saved packages yet</h3><p style={{ margin: '8px 0 16px' }}>Browse packages and tap ♥ to save your favourites.</p><Link className="btn btn-o" href={VIEW_PATHS.packages}>Browse packages</Link></div>}</div></section>
  );
}
