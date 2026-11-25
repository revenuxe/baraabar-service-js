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
- `SUPABASE_BACKEND_EMAIL` and `SUPABASE_BACKEND_PASSWORD` (server-only restricted account)
- `REQUEST_BUDGET_SECRET` (server-only random value, at least 32 characters)

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

Unauthenticated and non-admin users cannot read or mutate lead records directly. Admin requests use the signed-in user's scoped Supabase client; a separate restricted Auth account can only call the rate-budget and enquiry-intake functions. It cannot read leads, edit existing leads, or access the admin workspace. Application runtime code never reads service-role or Supabase secret keys.

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

Deploy on a Node.js host that supports Next.js App Router server rendering and API routes; a static-only export cannot serve the admin workspace or enquiry API. Configure the variables listed above through hosting secrets. Keep HTTPS and secure cookies enabled in production. After deployment, repeat public enquiry and administrator sign-in checks on the live domain, validate schema with Google Rich Results Test, and submit `https://www.baraabar.com/sitemap.xml` in Search Console. Live hosting/DNS and indexing are not verified by the local tests.

## Restricted backend setup and login troubleshooting

Apply both migrations in `supabase/migrations/` through your trusted Supabase SQL Editor or linked CLI. The second migration replaces the privileged rate-budget function and adds a narrowly scoped enquiry function. Both check the server-controlled Auth role internally. Anonymous callers cannot execute either function. Existing admin RLS policies remain in effect.

In Supabase Authentication, create a separate confirmed user with a unique generated password (at least 32 random characters). Do not use the administrator account. Using that user's UUID from Authentication, run in the SQL Editor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || '{"role":"website_backend"}'::jsonb
where id = 'REPLACE_WITH_BACKEND_USER_UUID'::uuid;
```

Set its email and password as `SUPABASE_BACKEND_EMAIL` and `SUPABASE_BACKEND_PASSWORD` in local and hosting secrets. Generate a separate random `REQUEST_BUDGET_SECRET` of at least 32 characters. Keep all three free of the `NEXT_PUBLIC_` prefix. Keep the public project URL and publishable key configured too. Redeploy after setup. The backend signs in without browser cookies, caches its short-lived session in server memory, and authenticates again before expiry. Never grant this account the admin role. Keep public signup disabled if the site only needs the existing administrator and backend accounts.

Remove `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_SECRET_KEY` from the deployed site's environment. Application runtime no longer uses them. Legacy provisioning and integration scripts still require elevated credentials and should only run in a trusted local environment, never in the deployed app. This implementation has no privileged-key fallback or rate-limit bypass.

`LOGIN_RATE_LIMIT_UNAVAILABLE` means restricted backend credentials, request-budget secret, migration, or connectivity need checking. `LOGIN_AUTH_UNAVAILABLE` means Supabase Auth initialization or connectivity failed. Infrastructure failures return 503; an exhausted request budget returns 429. Verify a public enquiry and administrator login after deployment.

`.gitignore` excludes `.env*` except the empty `.env.example` template, plus the local initial-admin credential file. Do not force-add secret files. Ignoring files does not remove prior commits; rotate any credential previously committed or shared. Avoid storing production customer screenshots or database dumps in Git.

Vercel redirects the apex domain to `www.baraabar.com`; the SEO origin follows that host. `NEXT_PUBLIC_SITE_URL` overrides it when needed. Local development uses `http://localhost:3000` with `npm run dev`.
