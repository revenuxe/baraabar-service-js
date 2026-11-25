# Baraabar Services

Mobile-first washing machine service website and private lead-management workspace. Built with Next.js App Router, React, TypeScript, and Supabase. Branding uses Baraabar navy (#002048), with local service photography and illustrative AI-generated assets.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. Production: `npm run build` then `npm start`.

## Supabase configuration

The connected Supabase project is **baraabar services**, reference `leavskuqqhwfghbkickj`, in Mumbai. The local CLI is linked to this project. Its configuration is in ignored `.env.local`. Copy the variable names from `.env.example` when deploying and add values through the hosting provider's secret settings.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never add a NEXT_PUBLIC prefix)

Keep production cookies secure over HTTPS. `COOKIE_SECURE=false` is only for local HTTP production-mode testing, if your browser requires it.

The schema migration lives in `supabase/migrations/20261125010000_lead_management.sql`. It defines leads, change history, admin RLS policies, and a shared database request budget. Never run destructive database resets against the linked production project.

## Public enquiries

Add opens a native full-screen dialog containing selected services and just name, mobile number, and PIN code. The homepage and `/contact` also have the shared enquiry form. Service names persist in session storage; personal details do not. Prices are recalculated from the server's catalogue when the request is saved. The API validates fields, rejects cross-origin browser submissions, and applies a shared request budget.

Successful requests are stored in Supabase and return an enquiry reference. An appointment is not confirmed by submitting the form. The previous webhook integration has been replaced by direct database storage.

## Admin workspace

- `/admin/login`: Supabase email/password authentication.
- `/admin/dashboard`: overview, status pipeline, searchable and paginated leads, customer details, service estimates, status changes, address and internal notes, technician assignment, appointments, and activity history.
- Add leads manually, export up to 1,000 matching active leads as CSV, move leads to Trash, restore them, or confirm permanent deletion from Trash.
- Account settings let the administrator change their own password after providing the current password.

`admin@baraabar.com` existed in the connected project. Its existing password was preserved and its server-controlled `app_metadata.role` was set to `admin`. Application admin access requires both the verified email and that role, with matching database row-level-security checks. This does not grant Supabase organisation/platform ownership.

Unauthenticated and non-admin users cannot read or mutate lead records directly. Admin requests use the signed-in user's scoped Supabase client; the server service key is used only for public intake, request budgets, and trusted provisioning.

## Validation

```sh
npm run build
npm run typecheck
```

`scripts/verify-integration.mjs` tests public enquiry submission, non-admin isolation, mobile form and dropdown, image uniqueness, expanded guide layout, admin lead changes, trash/restore, CSV export, manual lead entry, activity history, and desktop/mobile overflow using installed Chrome. It creates temporary test records and a temporary non-admin identity and removes them in its cleanup block. It uses an in-memory admin test session through Supabase Admin Auth and does not email a sign-in link or change the existing administrator password.

Run against a production server on port 3012 (or set TEST_BASE_URL):

```sh
node --env-file=.env.local scripts/verify-integration.mjs
```

Browser QA screenshots are in `artifacts/`; they contain synthetic test data only.

## Company pages

`/about`, `/contact`, `/terms-and-conditions`, and `/privacy-policy` share contact details and links. The legal pages are tailored drafts and should be reviewed against actual operating procedures before public launch.
# Bangalore landing page SEO

The location page is available at `/washing-machine-repair-bangalore` and linked in the shared footer. It reuses the homepage catalogue, booking flow, care guides, and enquiry form, with a dedicated Bangalore H1, local content, and FAQs. All six public routes share metadata from `lib/seo.ts` and linked JSON-LD from `app/page-schema.tsx`: LocalBusiness, WebSite, page-specific WebPage/AboutPage/ContactPage, breadcrumbs when the production origin is set, and Service/OfferCatalog on both landing pages. Business address and contact details come from `lib/company.ts`.

The confirmed production origin defaults to `https://www.baraabar.com`. `NEXT_PUBLIC_SITE_URL` can override it with another HTTP(S) origin if the deployment domain changes. Canonical URLs, social images, breadcrumbs, and `/sitemap.xml` use this shared origin. `/robots.txt` excludes admin and API routes from crawling; authentication continues to protect admin access.

After deployment, validate the live URL with Google's Rich Results Test, submit the sitemap in Google Search Console, and request indexing. Business Profile ownership, Search Console verification, and indexing require the actual production domain and account access. Search appearance and rankings are not guaranteed.

## Launch verification

The production build, six-page SEO verification, read-only authenticated desktop/mobile dashboard diagnostic, and full enquiry/admin integration suite pass locally. The login success handler uses a full page navigation to avoid overlapping router navigation and refresh. Admin routes include loading and recovery screens; dashboard requests time out after 15 seconds and return expired sessions to sign in.

Run `node scripts/verify-seo.mjs` and `node --env-file=.env.local scripts/verify-admin-render.mjs` against a running server (default port 3014; override `TEST_BASE_URL`). The admin diagnostic uses a temporary session without sending email or changing passwords. Its login-transition check intercepts a successful login response; it does not verify the existing administrator password.

Deploy on a Node.js host that supports Next.js App Router server rendering and API routes; a static-only export cannot serve the admin workspace or enquiry API. Configure the three Supabase variables listed above through hosting secrets. Keep HTTPS and secure cookies enabled in production. After deployment, repeat public enquiry and administrator sign-in checks on the live domain, validate schema with Google Rich Results Test, and submit `https://www.baraabar.com/sitemap.xml` in Search Console. Live hosting/DNS and indexing are not verified by the local tests.

## Production authentication troubleshooting

If the public website works but both admin routes fail, check the Vercel runtime logs for `[admin-auth]`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for the Production environment. Set `SUPABASE_SERVICE_ROLE_KEY` for enquiry intake, request budgets and login rate limiting; never expose it as a public variable. Redeploy after updating environment variables. The proxy now returns a noindex, noncached 503 recovery page with `AUTH_CONFIGURATION` or `AUTH_CONNECTION` when initialization or provider access fails, rather than a bare 500. No credentials are included in diagnostics.

Vercel currently redirects the apex domain to `www.baraabar.com`; the default SEO origin follows that host. `NEXT_PUBLIC_SITE_URL` overrides it when needed. Local development uses `http://localhost:3000` with `npm run dev`; do not assume a temporary QA server on port 3014 is still running.

## Login POST 503

The public publishable key identifies the application; login rate limiting also requires a private backend key to call `consume_request_budget`. Configure `SUPABASE_SECRET_KEY` (new secret key) or `SUPABASE_SERVICE_ROLE_KEY` (legacy fallback) in Vercel Production and redeploy. Never put an `sb_publishable_` key in these variables. `LOGIN_RATE_LIMIT_UNAVAILABLE` indicates failure before password authentication; check the private key, project match and database migration/RPC. `LOGIN_AUTH_UNAVAILABLE` indicates initialization or connectivity failure at Supabase Auth. Database failures return 503; only an exhausted request budget returns 429.
