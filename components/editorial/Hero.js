/* Page hero gallery images used by the editorial pages (<div class="ph-gal"> with 3 photos) */
import { img } from '@/lib/format';

export function Gal({ imgs, one }) {
  return <div className={one ? 'ph-gal one' : 'ph-gal'}>{imgs.map((n, i) => <img key={i} src={img(n)} alt="" decoding="async" />)}</div>;
}
export const bg = n => ({ backgroundImage: `url(${img(n)})` });
