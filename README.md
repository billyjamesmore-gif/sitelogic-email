# @sitelogic-ai/email

Shared transactional email for the SiteLogic products — **Weather-Logix**,
**Tidy Site**, and **Project Flow**. One package, one Resend account, branded
per-product at runtime.

Built with [Resend](https://resend.com) + [React Email](https://react.email).
Framework-agnostic: it's a normal npm package the products consume — it is not
coupled to any single app.

## What it gives you

- `createEmailClient(config)` — a factory each product calls once with its own
  brand (name, colour, logo, from-address, support email). The Resend API key is
  shared across the umbrella account and read from `RESEND_API_KEY`.
- Typed send functions — one per email type, no stringly-typed template names:
  - `email.sendWelcome({ to, name })`
  - `email.sendReport({ to, periodLabel, stats, summary, ctaUrl })`
  - `email.sendReceipt({ to, planName, amount, date })`
  - `email.sendAlert({ to, title, body, tone })`
- **Dry-run mode** — renders templates without sending. Auto-on when
  `RESEND_API_KEY` is unset (so local dev / CI never require a live key), or
  force it with `dryRun: true`.
- Safe by design — validates brand config, never throws raw Resend errors
  (returns `{ outcome: "failed", error }`), never logs the API key.

## Install (from private GitHub repo)

The package lives in its own private repo. Install it in each product pinned to a
commit. The repo is **public** (it contains no secrets — every credential is a
runtime env var), so no auth/token is needed to install.

Add this to the consuming app's `package.json` dependencies — **use the
`git+https` URL, not the `github:` shorthand** (see gotchas below):

```json
"@sitelogic-ai/email": "git+https://github.com/billyjamesmore-gif/sitelogic-email.git"
```

Then `npm install`. The package's `prepare` script builds `dist/` automatically
on install.

### ⚠️ Two install gotchas (learned the hard way — Vercel will fail without these)

1. **Do NOT use the `github:owner/repo` shorthand.** npm resolves it to a
   `git+ssh://` URL, and Vercel's build environment has no SSH key → clone fails
   with `npm error code 128`. Always use the full `git+https://…​.git` form.
2. **npm still rewrites the lockfile `resolved` field to `git+ssh://` anyway.**
   After `npm install`, open `package-lock.json`, find the `"resolved"` line for
   `@sitelogic-ai/email`, and if it starts `git+ssh://git@github.com/…`, change it
   to `git+https://github.com/…`. Then run `npm ci` (what Vercel runs) to confirm
   it installs clean from the lockfile. Commit the fixed lockfile.

> **Upgrade path:** once you're iterating on templates often, publish to a real
> npm registry (npmjs or GitHub Packages) for clean semver instead of git refs.
> Not needed to start.

## Per-product setup

1. Set the shared key in the product's env (`.env.local` and Vercel project):

   ```
   RESEND_API_KEY=re_xxxxxxxx
   ```

2. Add a `lib/email.ts` that initialises the client with **that product's**
   brand + from address:

   ```ts
   // lib/email.ts  (Weather-Logix)
   import { createEmailClient } from "@sitelogic-ai/email";

   export const email = createEmailClient({
     brand: {
       productName: "Weather-Logix",
       fromAddress: "weatherlogix@send.sitelogic-ai.com",
       supportEmail: "support@sitelogic-ai.com",
       primaryColor: "#f97316",
       baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://weather-logix.vercel.app",
     },
   });
   ```

3. Call it from a server route / action:

   ```ts
   import { email } from "@/lib/email";
   await email.sendWelcome({ to: user.email, name: user.name });
   ```

## Adding this to Tidy Site and Project Flow

Same steps as Weather-Logix — the **only** things that change are the brand block
and from address. **Note:** both apps already have their own email code; add this
package *alongside* it (create `lib/sitelogic-email.ts` so you don't clobber an
existing `lib/email.ts`) and migrate existing sends later — don't tear out
working code.

1. Install (see install section + the two gotchas above):
   `"@sitelogic-ai/email": "git+https://github.com/billyjamesmore-gif/sitelogic-email.git"`
   then fix the lockfile `resolved` → `git+https`, `npm ci`.
2. Set `RESEND_API_KEY` (shared umbrella key) + `RESEND_DOMAIN_VERIFIED=true` in
   that repo's Vercel project. No `RESEND_FROM` needed — it comes from the brand.
3. Add `lib/sitelogic-email.ts` with `createEmailClient({ brand })` using that
   product's identity:

   - **Tidy Site:** `{ productName: "Tidy Site", fromAddress:
     "tidysite@send.sitelogic-ai.com", primaryColor: "#f97316", baseUrl:
     "https://tidysite.vercel.app", supportEmail: "support@sitelogic-ai.com" }`
   - **Project Flow:** `{ productName: "Project Flow", fromAddress:
     "projectflow@send.sitelogic-ai.com", primaryColor: "#f97316", baseUrl:
     "https://plotflow-five.vercel.app", supportEmail: "support@sitelogic-ai.com" }`

4. Call `sitelogicEmail.sendWelcome({ to })` (or `sendReport` / `sendReceipt` /
   `sendAlert`) from a server route/action — same typed API as Weather-Logix.

All three products share the one verified domain `send.sitelogic-ai.com` and one
umbrella Resend account; only the from-address and brand differ per product.

## Local development

```sh
npm install
npm run build          # compile to dist/ (ESM + CJS + types) via tsup
npm run preview        # React Email dev server at http://localhost:3010
```

`npm run preview` renders every template (with its `PreviewProps`) in the
browser so you can iterate on design without sending anything.

### Test send

```sh
npm run build
RESEND_API_KEY=re_xxx node scripts/test-send.mjs you@example.com
```

Omit `RESEND_API_KEY` to dry-run (renders, logs envelope, does not send).

## From addresses (single verified domain)

All products send under the one verified Resend domain
`send.sitelogic-ai.com`, each with a product-specific sender so emails look
distinct while sharing one account:

| Product | From |
|---|---|
| Weather-Logix | `weatherlogix@send.sitelogic-ai.com` |
| Tidy Site | `tidysite@send.sitelogic-ai.com` |
| Project Flow | `projectflow@send.sitelogic-ai.com` |

> ⚠️ **TODO before go-live:** `support@sitelogic-ai.com` (the `supportEmail`
> reply-to shown in every footer) does not exist yet. Set up Namecheap free
> email forwarding (support@ → your real inbox) so replies don't bounce, or
> change each product's `supportEmail` in its `lib/email.ts` to a working
> address. It's a per-product `BrandConfig` field, so no package change needed.
