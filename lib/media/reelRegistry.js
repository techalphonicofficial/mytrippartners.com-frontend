/* Browser-side registry of the reels rendered on the page (filled by <ReelCard/>), so the reel viewer can open
   instantly without waiting for the full site data. Falls back to useSite() for reels not on the page. */
export const REG = { reels: new Map(), CONFIG: null };
export function registerReel(r, CONFIG) { REG.reels.set(r.id, r); if (CONFIG) REG.CONFIG = CONFIG; }
