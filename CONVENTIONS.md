# TripPartner Next.js client — conventions

This app is a **React port of the original website** (`../legacy/website-source/src/*.js`, vanilla JS that built HTML strings).
The UI must stay **identical**: same elements, classes, ids, text and links, styled by the unchanged stylesheet
`app/globals.css`. Behaviour must match too. Only the implementation changes: real React components, App Router
routes with clean URLs, and server-side data from the backend.

Stack: Next.js 16.4 (App Router), React 19.3, **JavaScript** (no TypeScript). Before using a Next.js API, read
`node_modules/next/dist/docs/` — this Next.js version differs from older ones (e.g. `params` is a Promise).

## 1. Where the original code lives

- **Source:** `../legacy/website-source/src/*.js`, all loaded as one global script in this order: app, extra, detail, partner, system, improve, design, places, video, home2, weekend, header2, festive, partner2, polish, fit, next, api, qr-lib, payproof, seo.
- **The data (content) is NOT in those files any more.** It comes from MySQL (see §3); the old `*-data.js` files are in `../legacy/website-source/legacy/`.
- **Later modules override earlier ones.** A function's effective version is the *last* definition. Many are *wrappers* that call the previous version and then string-replace its HTML. For example, `home` is app.js:166 → polish.js:46 → fit.js:6 → next.js:64. Port the **composed** result.
  - Full map of redefinitions: `../legacy/website-source/defs-map.json` (name → definitions in load order).
- **Behaviour is spread across:**
  - `xxxInit()` functions, called after a view renders;
  - global click handlers `plannerClick`, `partnerClick`, `systemClick`, `headerClick`, `improveClick`, `designClick`, `videoClick`, and the one in `boot()`;
  - extra `document.addEventListener(...)` blocks inside modules.

  Find every handler for the `data-*` hooks and ids your views use (`grep -n "data-xyz\|#xyz" ../legacy/website-source/src/*.js`).
- **The old router `route()`** (app.js:563 plus wrappers in api.js, next.js, payproof.js, polish.js, seo.js) shows which function renders each view and which init runs.

## 2. Folder ownership (only edit files you own)

| Area | Routes (`app/…/page.js`) | Components | Also owns |
|---|---|---|---|
| foundation (lead) | `layout.js`, `[...slug]` (info pages + pSEO), `api/*`, sitemap/robots | `components/layout`, `providers`, `ui`, `seo`, `icons.js`, `lib/*` | — |
| home | `page.js` | `components/home/*` | |
| catalogue-detail | `destinations/[id]`, `packages/[id]` | `components/catalogue/detail/*` | `features/Lightbox.js` |
| catalogue-lists | `packages`, `themes`, `themes/[id]`, `holidays/india`, `holidays/international`, `deals`, `search`, `compare`, `wishlist` | `components/catalogue/lists/*` | `features/MobileSearch.js`, `features/QuickFind.js`, `features/CompareTray.js` |
| places | `india`, `india/[slug]` (state or category), `india/[slug]/[place]` (Next.js needs one param name per level; URL is `/india/<state>/<place>/`) | `components/places/*` | |
| editorial | `guides`, `guides/[id]`, `services`, `services/[id]`, `visa`, `departures`, `about`, `contact`, `not-found.js` | `components/editorial/*` (incl. `InfoPage.js` for faq/privacy/terms/cancellation, wired by the lead) | |
| media | `videos`, `weekend-getaways-from-delhi`, `christmas-new-year-packages` | `components/media/*` | `features/ReelViewer.js` |
| booking | `book/[id]`, `my-trips`, `pay`, `pay/[ref]`, `receipt/[ref]/[[...pf]]` | `components/booking/*` | `features/Planner.js` |
| partner | `travel-partner`, `travel-partner/create`, `travel-partner/book`, `travel-partner/requests`, `travel-partner/safety`, `travel-partner/profile/[id]` | `components/partner/*` | |

- **Shared library code:** you may add area-specific helpers in `lib/<area>/`.
- **Shared files are lead-owned:** `lib/*.js`, `components/ui|layout|providers|seo`, `icons.js`, `globals.css`. If you need a change there, describe it in your final report. Don't edit them.
- **A component another area needs:** export it from your folder (e.g. `components/places/HomePlaces.js` for the home page) and list it in your report.

## 3. Data

- **Server components:**
  ```js
  import { getSite } from '@/lib/site';
  const S = await getSite();
  ```
  `S` mirrors the original globals and helpers (`lib/store.js`):
  - **Data:** `S.CONFIG`, `S.DEST`, `S.PKG`, `S.THEMES`, `S.WEEKEND`, `S.FESTIVE`, `S.VISA`, `S.VISA_X`, `S.SERVICES`, `S.SVC_DETAIL`, `S.STATIC`, `S.DEPARTURES` (`[[pkgId, date]]`), `S.GUIDES`, `S.STATES`, `S.PLACES`, `S.CATS`, `S.BUDDIES`, `S.PFAQ`, `S.PFAQ2`, `S.REELS`, `S.SHOWREEL`, `S.LONG_WEEKENDS`, `S.HS_HINTS`.
  - **Lookups:** `S.D(id)`, `S.P(id)`, `S.T(id)`, `S.G(id)`, `S.ST(s)`, `S.PLC(id)`, `S.B(id)`, `S.RL(id)`, `S.pkgsOf(destId)`, `S.catBySlug(slug)`, `S.placeImg(p)`, `S.regionList(region)`.
  - **Live dashboard data:** `S.reviews` (published), `S.blocked` (Set of package ids not bookable → show an "Enquire" button instead of "Book"), `S.seo`.

  Prices, tags and festive seats/early-bird already include the dashboard overrides. Destination prices are already the cheapest package price.
- **Client components** get what they need for their **first render as props** from the server page. Pass plain data, not `S` (it has functions).
- **Full catalogue in the browser:** for features that need all of it after load (search, compare, wishlist, planner), use `useSite()` from `@/lib/client/hooks`. It returns `null` until loaded.
- **Per-device state:** use `@/lib/client/storage` (`WL`, `CMP`, `RV`, `DB`, `ls`) and the hooks `useWishlist`/`useCompare`/`useRecent`/`useDeviceDB`.
  - Same `localStorage` keys as the original. Read them only after mount (the hooks do this).
  - For other keys the original used (e.g. `tp_ps`, `tp_pq`, `tp_trips`…), keep **the same key and JSON shape**, so existing visitors keep their data.
- **Backend calls from the browser:** `@/lib/client/api` → `post('/leads', body)`, `get('/booking/REF?phone=…')`, `send(path, body)` (fire-and-forget with offline outbox). The endpoints are the ones the original `api.js` / `payproof.js` used, under `/api/public`.
- **Formatting:** `@/lib/format` (`img`, `inr`, `dname`, `waLink(CONFIG, txt)`, `telHref`, `fmtDate`, `wkday`, `MON`, `todayISO`, `cx`). Month choices: `@/lib/months` (`nextMonths()`, `monthOptions()`).
- **India places logic:** `@/lib/places` (`TLAB`, `km`, `nearestHubs`, `nearbyPlaces`, `placePkgs`, `aboutCopy`, `itinerary`, `tipsFor`, `faqsFor`, `placeMeta`, `placeJsonLd`).

## 4. URLs

Every old `#route` has a real URL (`lib/routes.js`):
- **Builders:** `PATHS.dest(id)`, `PATHS.pkg(id)`, `PATHS.theme(id)`, `PATHS.guide(id)`, `PATHS.service(id)`, `PATHS.state(s)`, `PATHS.place(p)`, `PATHS.cat(slug)`, `PATHS.book(id)`, `PATHS.buddy(id)`, `PATHS.pay(ref)`, `PATHS.receipt(ref, pf)`, `PATHS.info(id)`.
- **Fixed views:** `VIEW_PATHS.india` (`/holidays/india/`), `.international`, `.themes`, `.packages`, `.deals`, `.search`, `.compare`, `.account` (`/my-trips/`), `.partner`, `['partner-create']`, `['partner-book']`, `['partner-requests']`, `['partner-safety']`, `.guides`, `.departures`, `.visa`, `.services`, `.about`, `.contact`, `.wishlist`, `.places` (`/india/`), `.videos`, `.weekend`, `['christmas-new-year']`, `.pay`.
- **Old route strings stored in content** (e.g. a guide's call-to-action `"d-kashmir"`): convert them with `hashToPath(route, S)` or `routeHref(route, S)`.
- **Links:** use `next/link` `<Link href>` for internal links and `<a>` for external, `tel:`, `mailto:` and WhatsApp links.
- **Presets that used to be `data-*` hooks become query strings.** Examples: `/travel-partner/?g=Female`, `?women=1`, `?d=kashmir`, `?mode=month`, `?match=1`; `/travel-partner/create/?verify=1`; `/travel-partner/requests/?tab=fav`; `/search/?q=…&type=india|intl&theme=…`. Pages read them with `searchParams` (server) or `useSearchParams` (client).

## 5. Markup rules (fidelity)

- **Same structure:** same tags, `className`s, `id`s, text and attribute values as the original's **final DOM**, i.e. after its init functions ran. The checker compares that.
- **`data-*` attributes:** they were JS hooks. Replace them with React handlers; you may drop them. **Keep `data-plan`**, because the CSS styles it.
- **Inline styles:** convert `style="a:b"` to `style={{ a: 'b' }}` with the same values.
- **Icons:** `import { I, TI, RI, withProps } from '@/components/icons'` gives React elements. `withProps(I.chev, { width: '14', height: '14' })` replaces the original `.replace('<svg', '<svg width…')`. For one-off inline SVGs, write JSX.
- **No `dangerouslySetInnerHTML`** except JSON-LD (`<JsonLd/>`). Content is plain text: React escapes it like the original `esc()`. HTML that the original *templates* wrote (`<b>`, `<span class="code">`) becomes JSX.
- **Reuse the shared components.** Don't re-implement them:
  - **`@/components/ui/cards`:** `PkgCard` (= `pkgCard`, incl. the per-night hint), `TallDest` (= `tallDest`), `SecHead` (= `secHead`).
  - **`@/components/ui/buttons`:**
    - `HeartButton` (= `heartBtn`), `WishlistBigButton` (`data-wl-big`), `CmpButton` (= `cmpBtn`), `RailNav` (= `railNav`)
    - `CopyButton` (`data-copy`), `ShareButton` (`data-share`), `PlanButton` (`data-plan`, opens the planner)
    - `OpenButton feature="search|quickfind|login|…"`, `Acc` (accordion)
  - **`@/components/ui/LeadForm`:** `LeadForm` (= `leadForm` + `onLead`), `EnquireButton` (`data-enquire`).
  - **`@/components/seo/Seo`:** `JsonLd`, `SeoExtra` (= `pseoExtra`).
- **UI services (client):** `const ui = useUI()` from `@/components/providers/UIProvider`.
  - `ui.toast(msg)`
  - `ui.openModal(<Body/>, title, sub)` / `ui.closeModal()` — renders the original `#modal`
  - `ui.open('planner', dest)`, `ui.open('search')`, `ui.open('quickfind')`, `ui.open('login')`, `ui.open('lightbox', images, index)`, `ui.open('reel', reelId)`
  - `ui.register(name, fn)` to provide one of these
  - `ui.theme`, `ui.drawer`
- **Server first:** server components by default; `'use client'` only for components with state, effects or handlers. Keep client islands small (e.g. a page is a server component that renders a client `<Estimator/>`).
- **Dates and times:** the original computed "today", countdowns etc. in the browser. If server and client could disagree, compute in the client after mount, or render the same value on both sides (`suppressHydrationWarning` only on the text node that may differ).
- **No hydration mismatches:** don't read `localStorage`, `window` or `Date` during render in client components; use effects or the provided hooks.

## 6. Pages

```js
// app/packages/[id]/page.js
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
export const dynamicParams = true;
export async function generateStaticParams() { return []; }          // render on first visit, then cached (ISR)
export async function generateMetadata({ params }) { const { id } = await params; const S = await getSite(); return pageMetadata(S, `/packages/${id}/`); }
export default async function Page({ params }) { const { id } = await params; const S = await getSite(); const p = S.P(id); if (!p) notFound(); … }
```

- **Built-in SEO pages** (destinations, packages, places, states, categories, guides, themes, home, India index, videos, weekend, Christmas & New Year):
  - **Metadata:** use `pageMetadata(S, path)`. Titles and descriptions are already defined in `lib/pages.js`; don't duplicate them.
  - **Structured data:** render `<JsonLd data={builtInPage(S, path).jsonld()} />` once in the page.
  - **Dashboard SEO override:** `const ov = seoOverride(S, path)`.
    - If `ov.h1` is set, show it instead of the page's H1 text.
    - If `ov.intro` or `ov.faqs.length` is set, render `<SeoExtra intro={ov.intro} faqs={ov.faqs}/>` directly after the page's first `<section>`, and add `faqLd(ov.faqs)` to the JSON-LD.
- **Other views:** use `viewMetadata(S, path, title, description)`. The title is the original `document.title` without the " | TripPartner" suffix.
- **Unknown ids:** call `notFound()`.

## 7. Verification (required)

Run these with `MSYS_NO_PATHCONV=1` in Git Bash. The dev server runs at http://127.0.0.1:3000 — **don't start or stop it, and don't run `next build`** (other agents share it).

```bash
node scripts/fidelity/compare.mjs /packages/kashmir-paradise/        # exact path(s)
node scripts/fidelity/compare.mjs '/packages/*' --quiet              # everything under a path
node scripts/fidelity/compare.mjs --group catalogue                   # your whole area (groups: home, catalogue, places, editorial, media, booking, partner)
```

- **What it does:** compares `#app` after scripts ran with the original site's final DOM. The baselines are in `scripts/fidelity/baseline/`, captured from the old site in a fresh browser with empty storage.
- **Your goal:** 0 differences and 0 JS errors for every page you own.
- **Allowed differences:** only ones caused by time or randomness (countdowns, "today", shuffled items). List each one in your report with the reason.
- **Behaviour testing:** markup equality is not enough. Exercise every interaction in a real browser. Write throw-away puppeteer scripts using `scripts/fidelity/browser.mjs` (`openBrowser()`, then `browser.createBrowserContext()` + `newPage()`) — click, type, submit — and assert the result.
  - Delete the scripts when done.
  - **Don't submit real data** to the backend beyond what you clean up. The backend at http://127.0.0.1:8080 is shared with the real local database.
  - **Booking, lead and partner submissions** may be tested with clearly fake names (e.g. "ZZ Test"). Delete them afterwards via the dashboard API: log in with `POST /api/auth/login {email:'admin@trippartner.local', password:'admin12345'}`, then `DELETE /api/leads/:id`, `/api/bookings/:id`, `/api/partners/:id`, etc.

## 8. Cross-area components (export these early — other agents import them)

Create these **first** (before the rest of your area), with the exact path and export name, so dependants are unblocked.
If you depend on one that does not exist yet, build your other parts first and come back to it; do not write it yourself.

| Exported by | File (default export unless noted) | Original | Used by |
|---|---|---|---|
| editorial | `components/editorial/DepTable.js` → `DepTable({ S, limit })` | `depTable`/`depRows` | home |
| editorial | `components/editorial/VisaCard.js` → `VisaCard({ S, v, k })` | `visaCard` | home |
| editorial | `components/editorial/InfoPage.js` → `InfoPage({ S, id })` | `staticPage` | lead (catch-all route) |
| media | `components/media/VideoSection.js` → `VideoSection({ S, … })` | `videoSection` (+ its init/player behaviour) | home |
| media | `components/media/FestiveSection.js` (+ named `FestiveBanner`) | `festiveSection`, `bannerFestive` | home |
| media | `components/media/WeekendSection.js` | `weekendSection` | home |
| media | `components/media/DestReelBlock.js` | `destReelBlock` | catalogue-detail |
| places | `components/places/HomePlaces.js` | `homePlacesSection` | home |
| partner | `components/partner/Avatar.js` | `avatar` | home |
| partner | `components/partner/PartnerPkgBox.js` | `partnerPkgBox` | catalogue-detail |
| catalogue-lists | `components/catalogue/lists/ListPage.js` → `ListPage({ title, lead, img, crumbs, items, eyebrow })` (with the list filters/sort/pagination of `listInit`) | `listPage` + `listInit` | lead (pSEO pages) |
| catalogue-detail | `lib/catalogue/detail.js` (named: `pace`, `permitNote`, …) | detail.js helpers | catalogue-lists (compare page) |
