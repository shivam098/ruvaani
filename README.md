# RUVAANI

**Thoughtful gifts. Lasting moments.**

A responsive gifting storefront based on the approved launch MVP of the RUVAANI Corporate & Festival Gifting PRD. Warm ivory, burgundy, editorial typography, original gift illustrations, and considered mobile layouts.

**Visual previews:** [Desktop homepage](docs/home-desktop.png) · [Mobile homepage](docs/home-mobile.png).

> **Safe by default:** `DEMO_MODE=true`. Explore the complete storefront without any credentials. Demo checkout and corporate enquiry previews do not submit or save contact/address details, take payments, or place real orders.
>
> **This is an MVP, not the full five-phase marketplace or a production-ready payments launch.** Database-backed features and the Razorpay test-mode integration are implemented. Live Razorpay keys are deliberately rejected until the production launch requirements below are completed.

## Stack

- Next.js 16 App Router and React 19, with TypeScript.
- Tailwind CSS 4 plus a custom responsive design system.
- MongoDB Atlas and Mongoose, using the Node.js runtime.
- Server-backed, revocable sessions in HttpOnly cookies; salted scrypt password hashes.
- Razorpay standard checkout: trusted server pricing, HMAC verification, captured-payment verification, and idempotent webhook processing.
- Zod validation, Lucide icons, original SVG product artwork.
- Node tests, an isolated MongoDB integration suite, and Playwright desktop/mobile checks.

The exact installed versions are in `package-lock.json`. The framework is pinned to a stable release rather than the registry's canary tag.

## 1. Run locally

Install **Node.js 24 LTS**, npm, and Git. No MongoDB, payment account, Docker, or API key is needed for the demo.

From an existing local project:

```powershell
Set-Location 'C:\Users\kumarshiv\Downloads\web dev\ruvaani'
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open **http://localhost:3000**.

If you already have `.env.local`, keep it; do not overwrite its configuration.

From another machine, first clone the private repository using the `shivam098` account:

```powershell
gh auth login
gh repo clone shivam098/ruvaani
Set-Location .\ruvaani
npm ci
Copy-Item .env.example .env.local
npm run dev
```

For a local production build:

```powershell
npm run build
npm run start
```

### What works without setup?

| Journey | Demo behavior |
|---|---|
| Homepage, collections, search, filters, sorting, pagination | Eight clearly illustrative gifts |
| Product details and quick look | Product content, availability, gift contents, message-card preview |
| Personalization | Name/message, with a sample per-gift surcharge |
| Gift bag and wishlist | Persist in this browser; no account required |
| Checkout | Validates sample address details and shows an explicit preview-complete screen; no API submission |
| Corporate enquiry | Validates a sample brief and displays a preview, not a submitted enquiry |
| Gift finder | Deterministic recipient/occasion/budget matches from actual catalogue entries |
| Account | Sign-in and registration disabled with setup explanation |
| Operations `/admin` | Read-only catalogue; no fabricated orders, customers, or revenue |

Do not put sensitive information in gift notes. Bag selections and gift notes are stored in the browser. Clear the bag on a shared device.

## 2. Enable database-backed accounts and enquiries

1. Create a MongoDB Atlas project and cluster. Use a replica set that supports transactions; a standalone local MongoDB process is not sufficient.
2. Create a dedicated database user with only the necessary access to the `ruvaani` database.
3. In Atlas **Network Access**, allow your current public IP for local development.
4. Copy the driver's connection string into `.env.local`. URL-encode any reserved characters in the database password.
5. Set:

```dotenv
DEMO_MODE=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_URL_ENCODED_PASSWORD@YOUR_CLUSTER/
MONGODB_DB=ruvaani
```

6. Initialize required unique, lookup, and expiry indexes, and seed the sample catalogue:

```powershell
npm run db:seed
```

The seed is insertion-only: rerunning it does not reset existing stock, prices, or product content. Indexes are required for sessions, rate limits, and order idempotency. They are created by the seed command, not automatically on each serverless request.

7. Restart the dev server. Register a customer at `/account`, submit an enquiry at `/corporate`, and inspect it from an administrator account.

Live-mode catalogue reads are request-time reads. Connection errors are shown rather than silently replaced by demo data.

### Create an administrator

Temporarily add these values to your local, ignored `.env.local`:

```dotenv
ADMIN_EMAIL=your-real-admin-email
ADMIN_NAME=Your Name
ADMIN_PASSWORD=use-a-unique-long-password
```

Use at least 12 characters, then run:

```powershell
npm run admin:create
```

Remove `ADMIN_PASSWORD` afterward. The command will not silently promote or replace an existing account.

Sign in normally at `/account`, then open `/admin`. Administrators can:

- Edit available product stock and publication status.
- Read corporate enquiry details and update their review status.
- Advance paid orders through confirmed, processing, shipped, and delivered.

Mutations require an authenticated `ADMIN`, a same-origin request, validation, and a transaction-backed audit record. Customers cannot gain administrator privileges through registration.

**Available stock means unreserved stock.** Do not overwrite it with a physical stock count without reconciling pending order reservations.

## 3. Connect Razorpay in test mode

Create or use a Razorpay merchant account, select **Test Mode**, and generate test API keys.

Add only to `.env.local` or encrypted Vercel environment settings:

```dotenv
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=a_separate_random_webhook_secret
```

Do not prefix secrets with `NEXT_PUBLIC_`. Never commit `.env.local`.

1. Configure automatic capture in Razorpay's payment capture settings.
2. Register a customer and add a gift to the bag.
3. Checkout creates a provider order using catalogue prices read on the server.
4. A MongoDB transaction reserves available stock and inserts a uniquely keyed local order.
5. The Razorpay payment window opens.
6. The server checks the checkout signature and fetches the payment from Razorpay to confirm the matching order, exact amount, INR currency, and `captured` status.
7. `/account` shows the order. **Check / resume payment** resumes the same pending provider order without reserving stock again.

Never trust a browser-only success message or a client-provided price.

### Webhook

After deploying an HTTPS test environment, configure:

```text
https://YOUR_DOMAIN/api/webhooks/razorpay
```

Subscribe to **`payment.captured`**, and set the same separate webhook secret in the dashboard and environment.

The endpoint verifies the signature against the original body and fetches the captured payment from the provider. Its conditional pending-to-paid update is idempotent, so duplicate webhooks and browser verification do not duplicate orders or subtract stock again.

Local webhook testing requires a deliberately configured public HTTPS tunnel or a Vercel test deployment. This project does not expose your local machine automatically. If a Vercel preview is access-protected, configure appropriate webhook access; a protected endpoint cannot receive ordinary Razorpay callbacks.

### Important payment limitation

Pending checkouts retain their stock reservation. They can be resumed, but there is **no automatic reservation expiry, cancellation, or refund workflow** yet. Do not simply return stock to inventory while a provider order can still accept a late payment.

Before a real-money launch, implement provider-aware abandonment reconciliation, expiry/cancellation, late-payment handling, refunds, and operational alerts. Only then remove the explicit test-key-only guard in `src/lib/razorpay.ts` after review and UAT. Setting `DEMO_MODE=false` alone does **not** enable live payments.

## 4. Deploy the demo to Vercel

1. Sign in to Vercel and connect the GitHub account **`shivam098`**.
2. Grant the Vercel GitHub integration access to the private **`shivam098/ruvaani`** repository.
3. Select **Add New -> Project -> Import** and select `ruvaani`.
4. Use **Next.js**, the repository root, and **Node.js 24.x**. Keep the standard output settings. Build command: `npm run build`; install command: `npm ci`.
5. Add these environment variables for the environment you are deploying:

| Variable | Demo value |
|---|---|
| `DEMO_MODE` | `true` |
| `NEXT_PUBLIC_SITE_URL` | Your final HTTPS Vercel URL or custom domain |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional support number, country code + number, digits only |

6. Deploy. If you did not know the generated URL beforehand, update `NEXT_PUBLIC_SITE_URL` after the first deployment and **redeploy**.
7. Open the homepage, collection, product detail, bag, checkout preview and corporate enquiry preview on both a desktop and a phone.
8. For a custom domain, add it in Vercel project settings, follow the supplied DNS records, update `NEXT_PUBLIC_SITE_URL`, and redeploy.

No `vercel.json`, custom output directory, separate Express server, database, or payment key is needed for the demo. This repository has not been automatically linked to a Vercel account or deployed on your behalf.

### Deploy a database-backed test environment

Keep a separate Atlas database and Razorpay test account configuration from production.

- Set `DEMO_MODE=false`.
- Add `MONGODB_URI`, `MONGODB_DB`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
- Seed that exact database once from your machine, and provision its administrator using the commands above.
- Configure Atlas network access for the Vercel project's outbound connections. Do not assume the IP allowed for your laptop covers Vercel.
- Prefer controlled outbound IPs or an appropriate secure networking arrangement. Do not casually open Atlas to every internet address. Use a dedicated least-privilege database user and strong credentials.
- Choose a Vercel function region near your Atlas cluster.
- Redeploy after changing mode or environment values. Use the exact deployed origin for `NEXT_PUBLIC_SITE_URL`.
- Confirm webhook accessibility, capture configuration, and end-to-end Razorpay test transactions.

## Environment reference

| Variable | Required when | Purpose |
|---|---|---|
| `DEMO_MODE` | Explicitly recommended | Defaults to `true`; only the exact string `false` enables server persistence |
| `NEXT_PUBLIC_SITE_URL` | Deployment | Canonical URLs, metadata, and allowed browser origin |
| `MONGODB_URI` | Database mode | Private Atlas connection string |
| `MONGODB_DB` | Database mode | Defaults to `ruvaani` |
| `RAZORPAY_KEY_ID` | Test checkout | Server-side test key ID, returned only when opening checkout |
| `RAZORPAY_KEY_SECRET` | Test checkout | Private provider API/HMAC secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhooks | Separate private webhook signing secret |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional | Enables a support link; not WhatsApp Business API messaging |
| `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` | Local provisioning only | Used only by `admin:create`; remove the password after use |

## Development checks

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:backend
```

- Unit tests cover totals, thresholds, personalization, cumulative stock, schema rejection, passwords, and HMAC checks.
- Browser tests use port **3100**, start/stop a local production server, and cover desktop/mobile journeys. They require a preceding demo-mode build.
- Backend integration tests start an **isolated temporary MongoDB replica set** and a dev server on port **3101**, then stop both. The first run downloads a MongoDB test binary. They test real database-backed authentication, permissions, quotes, reservation races, order idempotency and webhook handling against an explicit **Razorpay test double**, not the external payment service. They never use your Atlas database.
- Automated accessibility checks are not a substitute for manual screen-reader and keyboard evaluation.
- Screenshots and traces are local in ignored `test-results`; do not commit reports containing customer information.

### Known development dependency advisory

At implementation, `npm audit --omit=dev` reported no production dependency advisories. The lint dependency chain (`eslint-config-next -> fast-glob -> micromatch -> braces`) had five high-severity audit entries from one unfixed nested-pattern advisory. These packages are development tooling, not customer-facing runtime dependencies. Do not use `npm audit fix --force` to downgrade the application framework; update compatible lint tooling when a fix is available.

## Project map

```text
src\app                    Public pages, metadata and API route handlers
src\components             Storefront, artwork, forms, cart and operations UI
src\lib\catalog-data.ts     Illustrative catalogue; replace before launch
src\lib\commerce.ts         Integer-paise totals and deterministic gift filtering
src\lib\models.ts          MongoDB schemas and indexes
src\lib\auth.ts            Revocable server sessions and role checks
src\lib\http.ts            Origin checks, payload limits, rate limits, API errors
src\lib\razorpay.ts        Provider calls and captured-payment verification
scripts                    Database initialization and admin provisioning
tests                      Unit, isolated backend and browser checks
public\images              Locally served licensed editorial photography
```

## What comes next from the PRD

This iteration is the user-approved launch MVP, not every feature in the 28-page document.

| Later phase | Not implemented in this MVP |
|---|---|
| Corporate platform | Company accounts, formal quote generation/approval, recipient CSV/XLSX upload, logo storage, multi-address fulfilment, invoices |
| Merchant marketplace | KYC, vendor onboarding, product approval, merchant inventory/settlements/analytics |
| Integrations | WhatsApp Business API, email/SMS, Meta Pixel/Conversions API, shipment carriers |
| AI | LLM/semantic search, embeddings, AI content assistant; current gift finder is deterministic |
| Extended commerce | Coupons, reviews, account recovery/email verification, CMS, automated refunds/returns/cancellations |

### Production launch gates

Before accepting real customers or real money:

- Replace the illustrative catalogue, product artwork where necessary, stock, prices, tax rules, shipping rules and commercial copy with approved business data.
- Publish finalized business identity, contact details, privacy/retention/deletion policies, terms, delivery commitments, cancellation and refund policies. Current policy pages are explicitly development-stage notices.
- Implement password recovery, email verification, customer support procedures, and appropriate administrative account protections.
- Complete reservation expiry, cancellation, refund and late-payment reconciliation; verify failure and retry flows.
- Configure order notifications, shipping carrier tracking and actual serviceability.
- Define admin stock reconciliation rules. Do not treat the dashboard's latest-100 overview as financial accounting.
- Add production observability and actionable server diagnostics without logging passwords, tokens or customer addresses. Current API errors log an incident ID and error class only.
- Add an appropriate production CSP and operational abuse controls, complete independent security testing, and manually test accessibility.
- Configure Atlas backups, retention, monitoring, restore testing, Vercel monitoring and alerting.
- Complete Razorpay sandbox UAT with the real provider, webhook retry testing, and business approval before lifting the live-payment guard.

## Visual assets

Gift-product artwork and the wordmark treatment were created for this project in `src/components/gift-artwork.tsx`. They are illustrations, not photographs of shipped products.

Editorial photography is locally downloaded from Unsplash under its free image license:

- `gifting.jpg`: image `photo-1607344645866-009c320b63e0` (black gift boxes with gold ribbons).
- `celebration.jpg`: image `photo-1513201099705-a9746e1e201f` (wrapped gift with pink ribbon).

No customer testimonials, client logos, ratings or sales figures have been invented.

## Official setup references

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Vercel Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [MongoDB Atlas network access](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
- [Mongoose and Next.js](https://mongoosejs.com/docs/nextjs.html)
- [Razorpay integration steps](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
- [Unsplash license](https://unsplash.com/license)
