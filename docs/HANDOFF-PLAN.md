# Charles Nalle Walking Memorial — Handoff Plan

**Version 3 · 23 September 2026** · Prepared by Notable / WBM Enterprises for the
Hart Cluett Museum (Rensselaer County Historical Society), Troy NY.
Replaces version 2 of 22 September. The museum's day-to-day operating manual
is `docs/HANDOVER.md`; this document is the transfer itself.

---

## How to use this plan

- Two roles: **WIL** (Notable) and **MUSEUM** (Amanda Irwin, or whoever holds the
  museum's logins). Every step says who does it, where, what to click, and what
  "done" looks like.
- Do the parts **in order**. Parts A–D take about one hour in total and are best
  done on one call or screen-share.
- **Do all of it before any plaque is installed**, so nobody scans a plaque while
  the site is moving.
- **One name, decided once.** The museum's Mapbox account already exists as
  `hartcluettmuseum` (Parts A2, B1 and B2 are done), so the GitHub account is
  `hartcluettmuseum` too. If GitHub says that name is taken, choose another,
  tell Wil, and replace `hartcluettmuseum` everywhere it appears in an address
  in this document.
- **The new permanent site address** (live after Part C):
  `https://hartcluettmuseum.github.io/Charles-Nalle-Walking-Memorial/`

## Where things stand today

| Workstream | Status |
|---|---|
| **Website build** | ✅ Complete. The map, the paintings hall, the chapter pages and the Android review were signed off on 22 September; the last edit (the chapter pages' floating play/pause control) shipped on 23 September, and Wil signed off the whole site the same day. The live site is that version. The repository was reduced to essentials the same day: one branch, `main`. |
| **Historical content** | ✅ Locked. Kathy Sheehan confirmed the copy in writing on 9 August 2026. Nothing in it is open. |
| **Narration** | ✅ All six recordings were regenerated on 15 August from the locked text. The two old contradictions (the "Liberty Street" bells, the river leap) are closed. |
| **QR codes** | 🟡 Made and machine-verified. Not yet released to the fabricator: the museum's plaque addresses must point at the museum-owned site first (Part D). |
| **Bronze plaques** | 🔴 Waiting on Part E: the QR release, the "ONCE HOUSE THE" typo, and Brian's confirmations. |
| **Ownership transfer** | 🔴 This plan. Parts A and B are done: the museum's GitHub and Mapbox accounts exist, and since 23 September the live map runs on the museum's Mapbox account. Part C, the repository transfer, is next. |

Known limitations that stay after handoff (the map page's weight on slow phones,
the two never-delivered photographs) are listed plainly in `docs/HANDOVER.md` §8.

---

## Part 0 — WIL: finish and freeze the build

**0.1 Done (23 September).** Every session has finished; the last change is
client round 45, on `main`.

**0.2 Done.** Deploy runs 303 and 304 are green; the live site is `main`'s tip.
For any later push: GitHub → the repository → **Actions** → the newest "Deploy to
GitHub Pages" run must show a green check with the title of the latest commit.

**0.3 Put the future address into the site now** (it is known in advance, so
this is done once, before the move). Tell Claude:

> Replace `makeitnotable.github.io` with `hartcluettmuseum.github.io` in
> `.github/workflows/deploy.yml` (the `SITE:` line), `astro.config.mjs` (the
> `site` fallback), `README.md` and `docs/HANDOVER.md` (§1 and §7). Commit to
> `main` and push.

Until Part C the site's internal "canonical" links will name the future
address. Visitors cannot see that; it is harmless.

Done when: Actions shows a green run for that commit.

---

## Part A — MUSEUM: create the two free accounts (15 minutes)

Use a **museum-owned email address that more than one staff member can open**
(the museum's general inbox is ideal). Never a personal address. Write every
password and every recovery code into the museum's password records.

### A1 · GitHub (this will hold the website) — ✅ done

1. Go to `https://github.com/signup`.
2. Email: the museum inbox. Password: a new, strong one. Username: `hartcluettmuseum`.
   (If GitHub says it is taken, use `hartcluettmuseum`; see the rule above.)
3. Complete the puzzle, enter the code GitHub emails you, and choose the **Free**
   plan. Skip any "personalize your experience" questions.
4. **Turn on two-factor authentication now.** GitHub will otherwise demand it
   later, at a bad moment. Top-right profile picture → **Settings** → **Password
   and authentication** → **Two-factor authentication** → **Enable** →
   **Authenticator app** → scan the code with the museum phone's authenticator
   app (Google Authenticator or Microsoft Authenticator, free from the app store)
   → type the 6-digit code → **Download recovery codes** → store them in the
   password records.
5. Check **Settings → Emails**: the museum address must show **Verified**.

Done when: you can sign in at `github.com` as `hartcluettmuseum`.

### A2 · Mapbox (the map's engine) — ✅ done

The museum's Mapbox account exists (`hartcluettmuseum`, no card on file), the
site's public token ("CNWM Website Token", starts with `pk.`) was created and
sent to Wil, and the map's style is already uploaded and published there (Part
B). Nothing to do here except keep the login in the password records. The
account password once appeared in a screenshot; Wil marked that resolved on
23 September 2026.

**Send Wil one thing:** the GitHub username.

---

## Part B — Move the map to the museum's Mapbox (20 minutes, on a call)

The map's custom look (its "style") lives today in Wil's Mapbox account as an
unpublished draft. After this part a museum-owned copy drives the site.

### B1 · WIL: publish and download the style — ✅ done

The style was published, downloaded (`troy-map-style.json`) and handed to the
museum on 22 September. A copy is kept in the repository at
`docs/handoff/troy-map-style.json` (added 23 September), so the museum always
holds the map's design. To restore it in any Mapbox account: Studio → **New
style** → **Upload** → choose that file.

### B2 · MUSEUM: upload it, publish it, copy its address — ✅ done

The museum uploaded and published the style in its own Studio. Its Style URL is
`mapbox://styles/hartcluettmuseum/cmud36po6000f01ru0zbjf2q4`. The museum never
needs to open Studio again.

### B3 · WIL: point the site at the museum's map — ✅ done 23 September (deploy run 307)

Verified the same day on Wil's phone over cellular data: `/map` and the Bakery's map draw with the museum's style and the route line. The steps below are kept for the record.

The change was prepared on 22 September (client round 39) and GitHub refused
the push: its secret scanning treats the museum's `pk.` token in
`.env.production` as a secret. It is a *publishable* token, visible in every
page by design (`docs/DEVIATIONS.md`), so it is safe to allow.

1. Signed in to GitHub as the repository admin, open
   `https://github.com/makeitnotable/Charles-Nalle-Walking-Memorial/security/secret-scanning/unblock-secret/3JhIPMRk8xMBVGFldcLi05bJSQf`
   → choose **"It's used in tests"** or **"It's a false positive"** → **Allow
   me to expose this secret**. If that link has expired, skip to step 2: the
   push will print a fresh link, and you allow it there. (If the repository
   ever refuses again, the alternative is an Actions **variable** named
   `PUBLIC_MAPBOX_TOKEN` in Settings → Secrets and variables → Actions →
   Variables; a real environment variable overrides the file.)
2. In `src/components/TroyMap.tsx` and `src/components/EmbedMap.tsx`, the line
   beginning `const STYLE =`: replace the whole value with
   `mapbox://styles/hartcluettmuseum/cmud36po6000f01ru0zbjf2q4`. No `/draft`
   on the end.
3. In `.env.production`: replace the token value with the museum's `pk.` token.
4. Commit to `main`, push, wait for the green run (about 3 minutes).
5. On a phone with Wi-Fi **off**, open the live site's `/map` page and one
   chapter. The map must draw with the custom look and the route line.
   Blank map = wrong token. Plain grey-and-yellow street map = wrong Style URL.

Done when: the live site runs on museum-owned Mapbox. Wil's own token and style
are then unused (deleted in Part F).

---

## Part C — Move the website to the museum's GitHub (30 minutes)

### C1 · WIL: freeze the shipped version (the last thing before the transfer)

1. Confirm nothing else is going to `main`: Parts 0 and B committed, Actions
   green on the tip.
2. Repository → **Settings** → **General**: **Default branch** must read
   `main`. If it still reads `v2`, click the switch icon beside it, choose
   `main`, **Update**, confirm. Then **Code** → **Branches** → delete `v2`
   (the trash icon). `main` must be the only branch left; that is the branch
   the museum will land on.

### C2 · WIL: transfer the repository

1. `https://github.com/makeitnotable/Charles-Nalle-Walking-Memorial` →
   **Settings** → **General** → scroll to the bottom, **Danger Zone** →
   **Transfer ownership** → **Transfer**.
2. New owner: `hartcluettmuseum`. Type the confirmation text GitHub asks for →
   **I understand, transfer this repository**.
3. Tell the museum the email is on its way.

At the moment the museum accepts, the old `makeitnotable.github.io` address
stops working. GitHub does not forward it. The plaques are not installed, so
nobody is affected; Part D gives the plaques the new address.

### C3 · MUSEUM: accept the transfer

1. In the museum inbox, open the email from GitHub: *"makeitnotable wants to
   transfer Charles-Nalle-Walking-Memorial to hartcluettmuseum"* → click the link →
   **Accept**. **This must happen within 24 hours** or the offer expires and Wil
   repeats C2.
2. Done when: `https://github.com/hartcluettmuseum/Charles-Nalle-Walking-Memorial`
   opens and shows the site's files.

### C4 · MUSEUM: switch publishing on and publish once

1. In the repository: **Settings** (tab along the top) → **Pages** (left menu).
   Under **Build and deployment**, **Source** must say **GitHub Actions**. If it
   says "Deploy from a branch", change it to **GitHub Actions**. Touch nothing
   else on that page.
2. **Actions** (tab). If a message says workflows are disabled, click
   **I understand my workflows, go ahead and enable them**.
3. **Actions** → in the left list click **Deploy to GitHub Pages** → on the right
   click **Run workflow** → Branch: `main` → the green **Run workflow** button. A
   new run appears. Wait for its green check (about 3 minutes).
4. Open `https://hartcluettmuseum.github.io/Charles-Nalle-Walking-Memorial/`. The
   opening page appears. Open `/map`: the map draws. Open `/bakery`: the
   chapter appears.
5. Repository front page → the ⚙ beside **About** (right-hand column) →
   **Website**: tick **Use your GitHub Pages website**, or paste the address
   from step 4 → **Save changes**. The link on the repository page then
   points at the live site.

Done when: the site is live at the new address.

### C5 · MUSEUM: who may edit

1. **Settings** → **Collaborators** (left menu; GitHub may ask for your
   password) → **Add people** → `makeitnotable` → role **Write** → **Add**.
   Wil accepts the invitation from his email. This is how Wil keeps helping.
2. On the same page, **remove every other name** that appears. Past
   developers' access ends with the transfer. Only `hartcluettmuseum` (owner) and
   `makeitnotable` remain. The museum can remove Wil at any time, the same way.

### C6 · MUSEUM: keep an offline copy

Repository front page → green **Code** button → **Download ZIP** → save it on
the museum's drive with today's date. It is a complete copy of the site: code,
paintings, audio, photographs and documents.

**Two rules for the repository from now on**

- Keep it **Public**. Never use "Change visibility". A private repository has
  no free website.
- Never **rename** it. The site's address is built from its name.

---

## Part D — MUSEUM: point the plaque addresses at the new site (5 minutes)

The bronze plaques carry `hartcluett.org/nalle/…` addresses. The museum's
Squarespace site forwards them. This is the step that makes the QR codes work.

1. Log in to Squarespace → **Settings** → **Developer Tools** → **URL Mappings**.
   If you cannot find it, type "URL mappings" into the search box at the top of
   the Squarespace menu.
2. If the six `/nalle` lines from August are already in the box: change
   `makeitnotable` to `hartcluettmuseum` in each line. That is the only change.
   If the box has no `/nalle` lines: paste these six exactly as written:

   ```
   /nalle -> https://hartcluettmuseum.github.io/Charles-Nalle-Walking-Memorial/ 302
   /nalle/bakery -> https://hartcluettmuseum.github.io/Charles-Nalle-Walking-Memorial/bakery 302
   /nalle/commissioners-office -> https://hartcluettmuseum.github.io/Charles-Nalle-Walking-Memorial/commissioners-office 302
   /nalle/mansion -> https://hartcluettmuseum.github.io/Charles-Nalle-Walking-Memorial/mansion 302
   /nalle/barbershop -> https://hartcluettmuseum.github.io/Charles-Nalle-Walking-Memorial/barbershop 302
   /nalle/ferry -> https://hartcluettmuseum.github.io/Charles-Nalle-Walking-Memorial/ferry 302
   ```

3. **Save.** The change is live immediately.
4. On a phone with Wi-Fi **off**, type `hartcluett.org/nalle/bakery` into the
   browser. The Bakery chapter opens. Try `hartcluett.org/nalle/mansion` too.

Keep the `302` on every line: it means the destination can be changed again
later without touching the bronze. Never put a `github.io` address into a QR
code or on a plaque; the bronze carries only `hartcluett.org/nalle/…`.

---

## Part E — QR codes and the plaques

1. **WIL:** test-scan all four QR files (`Week 0 Deliverables/QR Codes/`) with a
   phone camera on cellular, Wi-Fi off. Each must land on its chapter: Bakery,
   Commissioner's Office, Uri Gilbert Home, Barbershop. Also type
   `hartcluett.org/nalle/ferry` by hand (the Ferry Landing has no plaque).
2. **WIL:** release the QR artwork (SVG for fabrication, PNG for proofing) to
   Matt Crane, copying Brian Tolle. This unblocks fabrication and Matt's invoice.
3. **BRIAN TOLLE, before any bronze is cast:** the Commissioner's Office plaque
   proof reads **"THIS BUILDING ONCE HOUSE THE"**; it must read
   **"ONCE HOUSED THE"**. Still open as of today. Also confirm the four plaque
   positions match the four pins on the site's map, and the painting credit lines.
4. **MUSEUM:** pay Matt's invoice once the artwork is released.

---

## Part F — WIL: close-out (after Parts C and D are verified)

1. **Delete the old Vercel project.** ✅ Done 23 September: Wil deleted the
   project (its address now answers "404 DEPLOYMENT_NOT_FOUND"), deleted the
   Preview and Production environments Vercel had created on GitHub, pointed
   the repository's About link at the live site, and removed the repository
   from the Vercel app's access. The same day he deleted Vercel's 237 old
   build records from GitHub with the GitHub command-line tool, so the
   repository's deployment history holds only the site's own publishing runs.
2. **The old Mapbox token and style** in the `wbmdesign` account. ✅ Settled
   23 September. The site's old token turned out to be that account's
   Default public token, which Mapbox does not allow deleting; it stays, and
   it is public by design (it was always visible in the live site's code).
   Wil keeps the original CNWM style there as a second backup of the map's
   design. The site uses neither (B3).
3. **Send the museum one email** with: the new site address; this plan; the
   operating manual
   (`https://github.com/hartcluettmuseum/Charles-Nalle-Walking-Memorial/blob/main/docs/HANDOVER.md`);
   the QR artwork folder; the style file; and the sentence *"Ongoing cost is
   $0 per year: GitHub Pages and Mapbox are free at this site's scale, and no
   card is on file anywhere."*
4. **MUSEUM replies** confirming receipt. That reply plus the transfer records
   the contract's ownership transfer (§2.1) and documentation deliverable
   (§1.2.4) as complete.

---

## After the handoff — where everything lives

| Thing | Where | Owner |
|---|---|---|
| The website's code, paintings, audio, documents | `github.com/hartcluettmuseum/Charles-Nalle-Walking-Memorial`, branch `main` | Museum |
| The live site | `https://hartcluettmuseum.github.io/Charles-Nalle-Walking-Memorial/` | Museum (GitHub Pages, free) |
| The plaque addresses | `hartcluett.org/nalle/…`, six lines in Squarespace | Museum (permanently) |
| The map's style and token | Mapbox account `hartcluettmuseum` | Museum (free) |
| Offline copy | The ZIP from C6 | Museum |
| Logins and recovery codes | The museum's password records | Museum |

- **The site is the `main` branch**, the one you see when you open the
  repository, and the only branch. How to change words on the site:
  `docs/HANDOVER.md` §3.
- **Ongoing cost: $0.** No subscriptions, no renewals, no card on file anywhere.
- **If the site ever needs to move again**, only the six Squarespace lines
  change. The bronze never does.

## If something goes wrong

| Symptom | Cause and fix |
|---|---|
| New address shows "There isn't a GitHub Pages site here" | Pages is not switched on: C4 step 1, then C4 step 3. |
| The Actions run ends with a red ✗ | Click it, screenshot the red step, send it to Wil. Do not re-run it repeatedly. |
| The map is blank on the new site | The token is not the museum's: Wil re-checks B3. |
| A plaque address shows Squarespace's own "page not found" | The URL Mapping line is missing or misspelt. Re-check Part D letter for letter: hyphens, no space before `->`, no slash at the end of a chapter address. |
| A plaque address lands on the old `makeitnotable` site | That line still says `makeitnotable`. Change it. |
| The transfer email expired | Wil repeats C2; the museum accepts within 24 hours. |
| The museum cannot sign in to GitHub | Use a recovery code from A1 step 4. |

## Definition of done

- [ ] Site live at the new address; the map draws; every chapter opens
- [ ] The six Squarespace lines point at the new address; all four QR codes tested on cellular
- [ ] `makeitnotable` is a collaborator; no other outside accounts remain
- [x] Old Vercel project deleted (23 September)
- [x] Vercel's leftovers removed from GitHub (23 September)
- [x] Old Mapbox token and style settled (23 September: the token is Wil's default public token and stays; the style is kept as a backup)
- [ ] ZIP copy stored; logins and recovery codes in the museum's records
- [ ] The close-out email sent and acknowledged (ownership, documentation, $0 per year)
- [ ] QR artwork released to Matt; typo fix confirmed by Brian before casting

## Who to contact

| Role | Person |
|---|---|
| Historical authority, all story content | Kathy Sheehan, Hart Cluett |
| Museum administration, hosting, Squarespace, the new accounts | Amanda Irwin, Hart Cluett |
| Artist, plaque design and placement | Brian Tolle, Brian Tolle Studio |
| Plaque fabrication | Matt Crane, Silver Crane LLC |
| Website design and build; support after handoff | Wil Bayne, Notable / WBM Enterprises |
| Paintings and studies | Mark Priest (Nalle Series) |
