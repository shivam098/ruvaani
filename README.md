# RUVAANI

**Gifts that create lasting moments.**

A responsive, quote-first gifting catalogue with the supplied RUVAANI logo,
baby-pink base, green lettering, burgundy/gold accents and a light-peach marquee.
A single full-width seasonal hero uses supplied hamper imagery, followed by
unified discovery, a matching featured edit, catalogues, the RUVAANI promise
and a short brand story. The approved blush palette is retained throughout.

**Visual previews:** [Desktop homepage](docs/home-desktop.png) · [Mobile homepage](docs/home-mobile.png).

> **Current scope:** the owner approved replacing the original illustrative
> retail shop with a quote-only catalogue. Direct checkout is disabled in both
> demo and database modes. This is not the full marketplace from the original PRD.
>
> **Safe default:** `DEMO_MODE=true`. The catalogue and wishlist work without
> credentials. The enquiry form is explicitly a preview: it does not send or save
> personal details. The published phone links can be used for real enquiries.

## Catalogue and brand sources

- `RUVAANI Creation.pdf`: 16 named products/presentation options from page 5,
  a minimum enquiry of 10 gifts, business contact details and the
  Select → Customise → Approve → Produce → Deliver process.
- Three additional owner-supplied sheets:
  - **Single Premium Box:** ₹1,299.
  - **Corporate Hamper:** ₹1,599.
  - **Executive Corporate Hamper:** ₹2,199.
- Two owner-supplied Navratri Kanya / Kanjak posters:
  - **Cone Hamper:** starting at ₹99.
  - **Kanya / Kanjak Hamper:** starting at ₹149.
- Package contents and prices are transcribed from the sheets. Full sheets are
  available on all five product pages. Navratri prices are explicitly labelled
  **From**, not presented as fixed prices. Other prices are catalogue references, not final
  checkout prices; tax, branding, availability and delivery require confirmation.
- The remaining 16 entries have **no invented prices, stock, weights or capacities**.
  Presentation options are not represented as automatically included products.
- This is a partial catalogue, not a claim that the full range has been supplied.
- The horizontal logo uses the supplied RV monogram on the left, the corrected
  **RUVAANI** wordmark (two A's) from the updated reference on the right, and
  **Creations & Packaging** beneath the name in the header and footer.
  Product images are cropped
  from the supplied PDF/sheets and optimized as local WebP files; no third-party
  image-generation or document-processing service is used.
- All three owner-approved contact numbers are shown as telephone links.
  A definitive WhatsApp destination is not inferred; set the optional environment
  variable after confirming it.

`src/lib/catalog-data.ts` is the public catalogue's source of truth in **both**
deployment modes. `CatalogueItem` intentionally has no checkout price or stock
fields. Its optional `cataloguePrice` uses integer **paise**; `priceType: "starting"`
distinguishes the two Navratri offers from fixed catalogue reference prices.
Source attribution is retained per entry. The minimum indicative enquiry budget
is ₹99 per gift, with the existing 10-gift minimum unchanged.

The catalogue is read-only in the operations UI; changes are made in source,
reviewed and deployed. The old database product collection does not override it.
Original priced products exist only in test fixtures.

## Stack

- Next.js App Router, React, TypeScript.
- Tailwind CSS and a custom responsive design system.
- Local images rendered with `next/image`.
- MongoDB/Mongoose for accounts, sessions, enquiries and existing orders.
- Zod input validation, revocable HttpOnly sessions, salted scrypt passwords,
  same-origin API checks and database-backed rate limiting.
- Node unit tests, isolated MongoDB integration tests, and Playwright desktop,
  mobile and accessibility checks.

Exact versions are recorded in `package-lock.json`; use Node.js **24.x**.

## Local setup

```powershell
Set-Location 'C:\Users\kumarshiv\Downloads\web dev\ruvaani'
npm ci
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

Open `http://localhost:3000`. Keep an existing `.env.local`; do not overwrite it.
The repository is private: clone `shivam098/ruvaani` with the owner's authorized
GitHub account when setting up another machine.

No database, Razorpay account or API key is needed to browse the catalogue.

The homepage order is **scrolling marquee → logo/navigation → featured event →
unified discovery → matching featured gifts → catalogue → promise → story → footer**.
The festival switcher opens with Navratri,
with Diwali one tap away. It does not auto-rotate, and displays only one event
heading and image at a time. Both events use the existing blush/green palette.
The marquee repeats three distinct messages automatically, with no Play/Pause
buttons. Keyboard focus pauses it for reading; hover does not stop it. A compact
dismiss button hides the strip until a full reload, including during in-app
navigation, and returns focus to the home logo. Dismissal is not saved to browser
storage. Reduced-motion visitors see every message as static text.
The full-width pink/peach event backdrop has original botanical line details and
a wider image layout, instead of leaving bare gutters around a dark-green card.
The event uses supplied catalogue photography, not third-party promotional art.
The newer Diwali poster is a palette reference, not a replacement price list.

The storefront uses a 16px body/form scale, readable secondary copy and at least
44px key touch targets. On small phones, gift cards stack rather than compress
their descriptions or actions. Save/Saved buttons provide a visible wishlist state;
Request a quote remains the primary action, not an Add to cart checkout.
One discovery grid switches between category, occasion and festival, with exactly
two category columns on narrow phones. Occasion cards promote existing gifting. They do
not advertise invented discounts, coupon codes, limited-stock or expiry claims.
Event descriptions, full gift descriptions, the five-step enquiry process and
policy details remain available through expandable sections. Policy pages show
plain-language summaries but retain their original details and explicit
unfinished-policy warnings; this presentation is not finalized legal policy.

### Change the featured event and marquee

In database mode, sign in as an administrator and open **`/admin` → Homepage**.
Choose **Festival to edit** to select either event, and **Festival shown first**
to choose the initial view. Edit the event name, current/upcoming label, headings, description, photograph,
image description, action labels/destinations, small print and marquee text/link.
Add, edit or remove up to four additional marquee messages (five total); all
messages share the configured marquee link. Previously saved single-message
settings keep their original message/link and gain the two new default messages
until edited. An explicitly saved empty additional-message list is respected.
Choose a photograph from the supplied catalogue library; arbitrary image URLs
and uploads are not supported. Each event and the marquee have independent
visibility controls. Hidden festivals are skipped; the remaining visible event
has no unnecessary switcher. Select **Publish homepage** to save both events,
the initial selection and marquee together in MongoDB without redeploying.
Reload the public homepage to see the saved content. Existing visitors can refresh
to receive updates; the site does not push changes into already-open pages.

The stable `/#featured-event` anchor follows whichever event is selected. If the
two events are both hidden, give the marquee another destination (such as `/shop`) or hide
it too. Links must stay on this website. For occasions not already in the enquiry
form, use `/corporate?occasion=Celebrations#enquiry` rather than an unsupported
occasion value.

This is a manually chosen seasonal feature, not an automatic holiday calendar,
countdown or delivery promise. No event dates or deadlines are inferred.
Authenticated, same-origin saves are validated and audited in one transaction;
a stale editor cannot overwrite another administrator's update.
Live requests read the persisted settings without a cross-request content cache.
Database errors are surfaced rather than silently replacing published content.
Defaults in `src/lib/homepage-content.ts` apply before the first save and in demo
mode. Legacy saved settings retain their original event and marquee while gaining
the additional Navratri event and Navratri-first selection when these fields are
absent. Existing saved fields are never overwritten by a read, and an explicitly
hidden event remains hidden. Demo mode shows a clearly read-only editor; enabling
publishing requires the MongoDB and administrator setup below.

| Journey | Current behavior |
|---|---|
| Homepage and collection | 21 sourced entries; Navratri/Diwali switcher; unified discovery; category, occasion, festival, price and recipient filtering |
| `/collections`, `/occasions`, `/festivals` | Directories and reusable source-scoped landing pages with customisation, catalogues and enquiry |
| `/catalogue` | Seven browsable editions with real downloadable, text-searchable branded PDFs |
| Product details / quick look | Supplied imagery, package contents where provided, prices on request, labelled reference prices or advertised starting prices |
| Request a quote | Selected item, supported product occasion and validated quantity carry into the enquiry; budgets from ₹99 and 10-unit minimum |
| Wishlist | Browser-local item IDs under `ruvaani-wishlist-v1`; no names or addresses |
| Gift finder | Recipient, occasion and indicative budget carry into the brief; no unverified budget/stock matching |
| Contact | All three supplied telephone numbers; optional configured WhatsApp |
| Enquiry in demo mode | Explicit non-submitting preview with telephone alternatives |
| Enquiry in database mode | Validated, rate-limited persistence with consent, reference number and server-resolved item name |
| Operations | Read-only catalogue; authenticated enquiry/order operations, editable homepage and opt-in aggregate insights |
| Old `/cart` and `/checkout` links | Redirect to the enquiry form |
| Direct `POST /api/checkout` | HTTP 410; no order, provider request or stock reservation |

Old demo bag data is left untouched but is not reused as catalogue selections.
Original retail IDs and new `rc-*` catalogue IDs never alias one another.

### Discovery, seasonal edits and PDFs

`src/lib/discovery.ts` defines eight categories, seven occasion/recipient edits,
seven festival edits and seven catalogue editions. These reference the same
source product IDs, not new inventory. **Wellness** and **Tech & Utility** remain
explicitly enquiry-only until actual standalone products are supplied. Later
festival edits are editorial selections, not promises of festival packaging,
stock or new accessories; no rakhi is implicitly included.

Category, occasion and festival filters intersect with each other and the page's
source selection. Numeric price ranges use only advertised starting or reference
prices. Unpriced items are included under **All prices** or **Price on request**,
not assumed to cost zero. Resetting filters never escapes the current collection.
Collection and recipient context carries into the editable enquiry requirements.
Existing `/shop?category=...` and product-specific quote links remain supported.

Desktop navigation offers disclosure menus, catalogue and enquiry actions;
search is secondary. Mobile adds a safe-area-aware Catalogue/Enquiry bar, hidden
on the enquiry, account, admin and printable pages. No WhatsApp number is inferred.

Committed PDFs in `public/catalogues` are the complete collection, Navratri,
Diwali 2026, corporate, wedding, festive and the three signature hampers.
Their printable source pages are `/catalogue/print/<edition>` and are noindex.
They include the supplied photographs, named contents, starting/reference-price
qualifications, MOQ and all three contact numbers. They are not quotations.

After changing products, edition membership or print layout, regenerate PDFs
before committing. This is a **local authoring step**, not a Vercel dependency:

```powershell
# Python with PyMuPDF 1.28.2 and Playwright Chromium are needed for this step.
python -m pip install pymupdf==1.28.2
npx playwright install chromium
npm run build
npm run catalogues:generate
```

The generator owns an isolated demo production server on port 3102, waits for
fonts/images, rejects vertically clipped pages, compresses photographs locally
and stops its own server afterward. Keep port 3102 free. Review the output pages
and commit all seven PDFs; Vercel serves them as static downloads. No Python,
Chromium or document-generation account is required on Vercel.

## Enable database-backed enquiries and accounts

1. Create an Atlas replica-set deployment and a dedicated least-privilege user.
2. Configure authorized network access for the machine or Vercel deployment.
   A laptop IP allowlist does not cover Vercel's outbound connections. Use an
   appropriate controlled networking arrangement, not an indiscriminate
   all-internet allowlist.
3. Set your ignored `.env.local` or Vercel environment settings:

```dotenv
DEMO_MODE=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MONGODB_URI=your-private-atlas-connection-string
MONGODB_DB=ruvaani
```

4. Run `npm run db:seed` once against that database. The historical script name is
   retained, but it now **creates indexes only**. It does not insert demo products,
   overwrite existing records or reset inventory.
5. Restart/redeploy. Submit an enquiry and retain its returned reference.

Database mode does **not** enable direct purchases. No Razorpay keys are required
for enquiries or accounts.

### Administrator provisioning

Temporarily set `ADMIN_EMAIL`, `ADMIN_NAME` and a unique `ADMIN_PASSWORD` of at
least 12 characters in the ignored local `.env.local`, then run:

```powershell
npm run admin:create
```

Remove the administrator password afterward. The script refuses to overwrite or
silently promote an existing user. Sign in at `/account`, then open `/admin`.

Enquiries show the selected item, requested quantity and budget, contact
information and requirements. Status changes are authenticated and audited.

### Optional first-party insights

Recording is off by default. After configuring live database mode and creating
indexes, set `ANALYTICS_ENABLED=true` and redeploy. **`/admin` → Insights** shows
the last 30 calendar days including today (UTC), plus saved-enquiry counts drawn
directly from enquiry records. `/api/admin/analytics` is administrator-only.

Recording accepts only enumerated category/occasion/festival clicks, catalogue
views/download clicks and enquiry-link clicks. Each MongoDB record contains a
server day, event, finite destination, count and expiry; no form values, full
URLs, visitor identifiers or analytics cookies. Daily records expire after 90
days via a TTL index (physical deletion is asynchronous). The existing abuse
limiter uses temporary hashed request-source buckets separately. Hosting request
logs are separate and remain subject to the hosting provider's configuration.

Demo mode never sends or records telemetry, even if the analytics flag is true.
Do Not Track and Global Privacy Control signals suppress client recording and
are also honoured by the endpoint. Origin, body-size, schema and rate-limit
checks apply. Failed telemetry is logged diagnostically without preventing
navigation or enquiry submission.

Counts are interactions, not unique visitors, attributed conversions or sales.
Download counts reflect a click, not proof of a completed transfer. Blockers,
privacy settings and network failures affect totals. No advertising or external
analytics service is installed. The owner must still finalise the privacy policy.

## Vercel deployment

1. In Vercel's dashboard, import the private `shivam098/ruvaani` repository.
   Authorize the Vercel GitHub App for that specific repository.
2. Use **Next.js**, repository root, **Node.js 24.x**, install command `npm ci`,
   build command `npm run build`, and the standard framework output.
3. Set `DEMO_MODE=true` for a catalogue/form-preview deployment.
4. Deploy, then set `NEXT_PUBLIC_SITE_URL` to the actual stable HTTPS project
   domain and redeploy. Do not assume a particular `vercel.app` name is available.
5. For real enquiry persistence, configure Atlas and database variables as above,
   create the indexes, provision the administrator and set `DEMO_MODE=false`.
6. Keep preview and production database configuration separate. Configure a
   custom domain in Vercel settings if desired; update the site URL and redeploy.

No `vercel.json`, custom output directory or separate Express server is needed.
Pushing `main` may trigger a deployment if the owner connected the Git integration;
a successful push alone does not verify a Vercel deployment.

### Environment reference

| Variable | Purpose |
|---|---|
| `DEMO_MODE` | Only the exact string `false` enables database-backed operations |
| `NEXT_PUBLIC_SITE_URL` | Actual site origin for metadata and origin checks |
| `MONGODB_URI`, `MONGODB_DB` | Server-only database configuration |
| `ANALYTICS_ENABLED` | Only `true` enables first-party aggregate recording, and only in live mode |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional verified destination, digits with country code |
| `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` | Local administrator provisioning only |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Retained only for existing test-order reconciliation; not needed for the catalogue |

Never commit `.env.local` or put secrets in `NEXT_PUBLIC_*` variables.

## Existing payment data

The quote-first change does not delete existing orders, sessions, product records,
or reservations. Existing-order payment verification, signed webhook handling,
customer-scoped resume and paid-order fulfilment remain available for continuity.
They cannot create a new checkout order. Test keys remain mandatory.

The former retail checkout implementation remains in Git history. Restoring it is
a separate, explicitly approved implementation task, not a configuration toggle.
Safe cancellation, reservation expiry, refunds and late-payment reconciliation
are still required before any real-money checkout launch.

## Checks

```powershell
npm run typecheck
npm run lint
npm test
npm run test:backend
npm run build
npm run test:e2e
```

- Unit tests cover catalogue sources/assets, exact provided package prices,
  quote-prefill boundaries, discovery intersections/price boundaries, analytics
  allowlists and preserved legacy commerce helpers.
- Backend tests use an isolated temporary MongoDB replica set and a Next.js server on port 3101
  and an explicit test-process-only Razorpay double. They cover live enquiries,
  checkout rejection without side effects, existing-order continuity, saved
  homepage settings and aggregate analytics/privacy/authentication.
  The test server uses `.next-integration` so an existing local development server
  does not need to be stopped.
- Browser tests use a production server on port 3100 after a build and cover
  desktop/mobile layouts, logos/images, catalogue actions, quote prefills,
  demo non-submission, contacts, keyboard menus, new collection journeys,
  actual PDF downloads, mobile conversion actions and accessibility.
- Tests never use a real Atlas database or charge a payment.

## Remaining work

Confirm the final catalogue, images/specifications, tax and delivery treatment,
primary contact and WhatsApp number. The business must approve its final policies.
The brochure's payment terms are described as requiring confirmation, not
implemented as an online payment facility.

Real enquiry persistence still needs Atlas configuration. Email/SMS notifications,
formal quotation documents, full product/CMS editing, corporate accounts,
recipient uploads, logistics, merchant onboarding/settlements, marketing/AI
integrations and production operations are not added by this catalogue redesign.

The previously documented development-tool advisory in the
`eslint-config-next → fast-glob → micromatch → braces` chain is not addressed by
this design change. Do not force a framework downgrade with `npm audit fix --force`.
