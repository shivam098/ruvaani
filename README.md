# RUVAANI

**Gifts that create lasting moments.**

A responsive, quote-first gifting catalogue with the supplied RUVAANI logo,
baby-pink base, green lettering, burgundy/gold accents and a light-peach marquee.
A full-width festive feature and editorial hero use supplied hamper imagery.

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
- Package contents and prices are transcribed from the sheets. Full sheets are
  available on those product pages. Prices are catalogue references, not final
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
fields. Its optional `cataloguePrice` uses integer **paise**. Source attribution
is retained per entry.

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
brand slogans → remaining content**. Diwali is the initial featured event.
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
Occasion cards promote existing corporate, wedding and festive gifting. They do
not advertise invented discounts, coupon codes, limited-stock or expiry claims.
Event descriptions, full gift descriptions, the five-step enquiry process and
policy details remain available through expandable sections. Policy pages show
plain-language summaries but retain their original details and explicit
unfinished-policy warnings; this presentation is not finalized legal policy.

### Change the featured event and marquee

In database mode, sign in as an administrator and open **`/admin` → Homepage**.
Edit the event name, current/upcoming label, headings, description, photograph,
image description, action labels/destinations, small print and marquee text/link.
Add, edit or remove up to four additional marquee messages (five total); all
messages share the configured marquee link. Previously saved single-message
settings keep their original message/link and gain the two new default messages
until edited. An explicitly saved empty additional-message list is respected.
Choose a photograph from the supplied catalogue library; arbitrary image URLs
and uploads are not supported. Both features have independent visibility controls.
Select **Publish homepage** to save both together in MongoDB without redeploying.
Reload the public homepage to see the saved content. Existing visitors can refresh
to receive updates; the site does not push changes into already-open pages.

The stable `/#featured-event` anchor follows whichever event is selected. If the
event is hidden, give the marquee another destination (such as `/shop`) or hide
it too. Links must stay on this website. For occasions not already in the enquiry
form, use `/corporate?occasion=Celebrations#enquiry` rather than an unsupported
occasion value.

This is a manually chosen seasonal feature, not an automatic holiday calendar,
countdown or delivery promise. No event dates or deadlines are inferred.
Authenticated, same-origin saves are validated and audited in one transaction;
a stale editor cannot overwrite another administrator's update.
Live requests read the persisted settings without a cross-request content cache.
Database errors are surfaced rather than silently replacing published content.
The Diwali defaults in `src/lib/homepage-content.ts` apply only before the first
save and in demo mode. Demo mode shows a clearly read-only editor; enabling
publishing requires the MongoDB and administrator setup below.

| Journey | Current behavior |
|---|---|
| Homepage and collection | 19 sourced catalogue entries, search, categories, alphabetical sort and pagination |
| Product details / quick look | Supplied imagery, package contents where provided, prices on request or labelled catalogue references |
| Request a quote | Selected item and validated quantity carry into the enquiry; 10-unit minimum |
| Wishlist | Browser-local item IDs under `ruvaani-wishlist-v1`; no names or addresses |
| Gift finder | Recipient, occasion and indicative budget carry into the brief; no unverified budget/stock matching |
| Contact | All three supplied telephone numbers; optional configured WhatsApp |
| Enquiry in demo mode | Explicit non-submitting preview with telephone alternatives |
| Enquiry in database mode | Validated, rate-limited persistence with consent, reference number and server-resolved item name |
| Operations | Read-only catalogue; authenticated enquiry/order operations and editable homepage event/marquee |
| Old `/cart` and `/checkout` links | Redirect to the enquiry form |
| Direct `POST /api/checkout` | HTTP 410; no order, provider request or stock reservation |

Old demo bag data is left untouched but is not reused as catalogue selections.
Original retail IDs and new `rc-*` catalogue IDs never alias one another.

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
  quote-prefill boundaries and preserved legacy commerce helpers.
- Backend tests use an isolated temporary MongoDB replica set and a Next.js server on port 3101
  and an explicit test-process-only Razorpay double. They cover live enquiries,
  checkout rejection without side effects and existing-order continuity.
  The test server uses `.next-integration` so an existing local development server
  does not need to be stopped.
- Browser tests use a production server on port 3100 after a build and cover
  desktop/mobile layouts, logos/images, catalogue actions, quote prefills,
  demo non-submission, contacts and accessibility.
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
