# Deviations from the WBM Constitution

Per the constitution's deviation policy, recorded **before** building.

## This is a client memorial site, not a WBM product

The constitution's stack (Next.js / Supabase / Stripe / Vercel / PostHog / Sentry /
Resend) exists for billable SaaS products. CNWM is a fixed-fee client deliverable for
the Hart Cluett Museum with a **hard zero-ongoing-cost requirement** and ownership
transfer at handoff. There are no users to authenticate, nothing to bill, no database,
and no server.

| Constitution | This project | Reason |
|---|---|---|
| Next.js (App Router) | **Astro** (static output + islands) | Fully prerendered pages → free GitHub Pages hosting with real deep-link URLs for the bronze QR codes. Locked client decision 2026-08-01 (docs/PLAN.md). |
| Vercel hosting | **GitHub Pages** | Zero-cost requirement; repo transfers to the museum's GitHub org at handoff. |
| Supabase + RLS | **None** | No user data, no persistence. Content is version-controlled JSON. |
| Stripe | **None** | Nothing billable; fixed-fee contract. |
| PostHog / Sentry / Resend | **None** | Would add accounts/keys the museum must maintain — violates the handoff constraint. No forms, no email, no server errors to capture. |
| Playwright smoke tests | Lighthouse CI perf/a11y budgets (M1) | The launch risks here are performance and accessibility, not auth/billing flows. |

**Blast radius:** none of the security baseline's server-side items apply (no secrets,
no inputs, no webhooks — the only external service is Mapbox, whose public token is
domain-restricted and migrates to a museum-owned free account at handoff).

## What still applies in full

- The **design baseline** (three states, reduced motion, keyboard/focus, 375px,
  plain-language failures) — enforced by ux-review at every milestone.
- TypeScript strict, dependencies pinned, `npm audit` clean.
- No personal data collected or logged, anywhere, ever.
- Definition of done still ends with a clean pre-launch ux-review pass and a
  RUNBOOK/handoff doc (M6).
