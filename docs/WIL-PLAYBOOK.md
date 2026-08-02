# Wil's Playbook — Getting CNWM v2 Across the Finish Line

*Written 2026-08-02 after the overnight build. The site is ~90% built and
deployed. Everything left is listed here, in order, with exact steps. Items
marked 🤖 mean "tell Claude and it handles the rest."*

---

## Part A — Send the Week 0 emails (do first, ~30 min)

Everything is staged in the project folder under **`Week 0 Deliverables/`**.

1. **Email Amanda** (draft: `Email - Amanda.md`). It contains copy-paste
   Squarespace URL-mapping lines. The redirects are the ONLY thing gating
   Matt's payment.
2. When Amanda confirms → open `hartcluett.org/nalle/bakery` on your phone.
   It should land on the current site's bakery page.
3. **Test-scan all 4 QR PNGs** in `Week 0 Deliverables/QR Codes/` with your
   phone camera.
4. **Email Matt** (draft: `Email - Matt.md`) with the QR files attached.
5. **Email Brian** (draft: `Email - Brian.md`) — includes the plaque typo
   flag (**"ONCE HOUSE THE" → "ONCE HOUSED THE"**, Commissioner's plaque).
   This must reach him BEFORE casting.

## Part B — Map token: ✅ DONE (2026-08-02)

Your publishable Mapbox token is committed in `.env.production`, so GitHub
Actions and Vercel builds both carry it automatically — no dashboard steps.
(It's a client-side `pk.` token that ships in the page bundle by design,
exactly as on the legacy site.)

**One optional hardening step (2 min, recommended before launch):** in
account.mapbox.com → Tokens → this token → add URL restrictions:
`https://charles-nalle-walking-memorial.vercel.app/*`,
`https://makeitnotable.github.io/*`, and `https://hartcluett.org/*` — then
nobody can reuse the token on other sites. Token migration to a museum
account stays in Part F.

## Part C — Content only you can provide

| # | What | Where it goes | Then |
|---|------|---------------|------|
| 1 | **Re-recorded audio**: Ch2 Pt1 (Second St Presbyterian bells fix), Ch4 Ferry (skiff fix), optionally Ch2 Pt2 | Replace files in `cnwm-v2/public/audio/` — **keep the exact same filenames** | 🤖 `node scripts/audio-timings.mjs`, commit, push — or just tell Claude "new audio is in" |
| 2 | **Ferry narrative rewrite** ("boarded a waiting skiff" — no leap) | — | 🤖 Tell Claude to draft it for Kathy's approval, or paste your wording |
| 3 | **Athenaeum building image** (from Brian/Kathy) for the Barbershop chapter | Drop anywhere in the project folder | 🤖 Tell Claude where it is |
| 4 | **Display typeface** (optional): site ships with Fraunces (free, OFL) | — | 🤖 If you buy a commercial face, tell Claude — one-line swap |

## Part D — Stakeholder review (start while C is in flight)

1. Send **Kathy** the preview link (the github.io URL, or a Vercel preview
   once you're logged in) and ask for a word-for-word read of the five
   chapters + The People page. Her sign-off is the content gate.
2. Send **Brian** the `/map` page — confirm the four pin placements match
   where plaques will actually stand — and the `/paintings` page for
   credit-line approval.
3. Amanda needs nothing further after Part A.

## Part E — Launch day (~1 hour, after C + D clear)

1. **Flip Vercel to v2:** project → Settings → Git → *Production Branch* →
   change to `v2`. The production URL (`charles-nalle-walking-memorial.vercel.app`)
   now serves the new site. Amanda's redirects keep working (legacy slugs
   301 via `vercel.json`) — the bronze QR codes are untouched.
2. **Publish the Mapbox style:** studio.mapbox.com → your style → *Publish*.
   🤖 Then tell Claude to drop `/draft` from `src/components/TroyMap.tsx`.
3. **Re-scan all 4 printed QR proofs** end-to-end on cellular. Every one
   must land on its v2 chapter.
4. Tell Matt: cast (with the typo fix confirmed).

## Part F — Handoff (contract close-out, after launch)

1. **Repo:** GitHub → repo Settings → *Transfer ownership* → Hart Cluett's
   GitHub org (they create a free org; Amanda's email works). GH Pages is
   already configured as the zero-cost escape hatch if they ever leave Vercel.
2. **Mapbox:** museum creates a free account → transfer the style (Studio →
   style → duplicate to their account) → new publishable token → 🤖 swap env
   values. Free tier covers this site's traffic comfortably.
3. **Close out Giuseppe Mele's** final $1,250 (addendum, 11/22/24) if unpaid.
4. Send the 1-page **RUNBOOK** (🤖 Claude drafts it at launch: URLs, accounts,
   how to edit content, who to call).

## Part G — Awwwards submission (optional, when proud)

1. awwwards.com → Submit → Site of the Day (submission fee applies — your call).
2. 🤖 Claude prepares: description copy, feature list, tech notes, and a
   device-frame capture video script. Credit: Notable (design/build), Mark
   Priest (paintings), Hart Cluett Museum + Brian Tolle Studio + RPI (project).

---

### What's already done (don't redo)

Media pipeline (275MB→95MB, committed) · design system (Fraunces/Newsreader,
per-chapter emotion palettes, paper grain) · press-and-hold painting reveal ·
synced narration with follow-along text · chapter pages (5) · map with route
draw, guided tour, 1860 lens, geolocation · title-sequence homepage · The
People · The Paintings · nav/footer · reduced-motion + keyboard support ·
all routes deployed via CI on every push to `v2`.

### Current truths

- Live (GH Pages): `makeitnotable.github.io/Charles-Nalle-Walking-Memorial/`
- Branch: `v2` on `makeitnotable/Charles-Nalle-Walking-Memorial`
- Bronze QR URLs: `hartcluett.org/nalle/*` — never anything else
- Narration timings are word-proportional estimates until your re-records
  land (then 🤖 re-run the script; the UI doesn't change)
