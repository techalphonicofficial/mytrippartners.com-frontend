/* Search results (legacy route "search": searchItems(STATE.search) in a listPage + listInit).
   The search lives in the URL: /search/?q=…&type=india|intl&theme=…&from=…&month=… */
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { searchItems } from '@/lib/catalogue/lists';
import ListPage from '@/components/catalogue/lists/ListPage';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, '/search/', 'Search'); }

const one = v => (Array.isArray(v) ? v[0] : v) || '';

export default async function Page({ searchParams }) {
  const sp = await searchParams, S = await getSite();
  const s = { q: one(sp.q).trim(), type: one(sp.type), theme: one(sp.theme), from: one(sp.from), month: one(sp.month) };
  const items = searchItems(S, s);
  return <ListPage listKey={JSON.stringify(s)} title={s.q ? `Holidays for “${s.q}”` : 'Search holidays'}
    lead={`${items.length} package${items.length === 1 ? '' : 's'} found${s.from ? ` · departing from ${s.from}` : ''}${s.month ? ` · travelling in ${s.month}` : ''}. Prices are per person; your expert will quote from your city.`}
    img={(items[0] && items[0].img) || 'group-lake'} crumbs="Search" items={items} />;
}
