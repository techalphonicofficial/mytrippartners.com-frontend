/* India Holidays index (legacy route "india": destIndex('india') + destFilterInit) */
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import DestIndex from '@/components/catalogue/lists/DestIndex';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, '/holidays/india/', 'India Holidays'); }

export default async function Page() { const S = await getSite(); return <DestIndex S={S} type="india" />; }
