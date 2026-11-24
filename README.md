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
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
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
