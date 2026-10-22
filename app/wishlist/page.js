/* Wishlist (legacy wishlistPage): packages saved on this device */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import WishlistView from '@/components/catalogue/lists/WishlistView';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, '/wishlist/', 'Wishlist'); }

export default function Page() {
  return (
    <>
      <section className="page-hero"><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>Wishlist</span></nav><h1>Your wishlist</h1><p className="lead">Packages you&apos;ve saved on this device. Tap the heart on any package to add it.</p></div><div></div></div></section>
      <WishlistView />
    </>
  );
}
