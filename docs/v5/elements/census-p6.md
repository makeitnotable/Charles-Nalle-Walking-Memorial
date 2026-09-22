# Type + rhythm census — http://localhost:4321

## Distinct rendered type sizes per page

The system declares four roles. More than ~6 rendered sizes on one page
means the ladder is not being obeyed.

| route | vp | # sizes | sizes (px) |
|---|---|---|---|
| / | 390 | 5 | 54, 16, 15, 14, 12 |
| /bakery | 390 | **11** | 54, 44.2, 40.5, 34, 26, 19, 16, 15, 14, 13, 12 |
| /commissioners-office | 390 | **11** | 54, 46, 34.7, 34, 26, 19, 16, 15, 14, 13, 12 |
| /mansion | 390 | **11** | 54, 44.2, 34.7, 34, 26, 19, 16, 15, 14, 13, 12 |
| /ferry | 390 | **11** | 54, 40.5, 34, 30.4, 26, 19, 16, 15, 14, 13, 12 |
| /barbershop | 390 | **10** | 54, 44.2, 34, 26, 19, 16, 15, 14, 13, 12 |
| /map | 390 | **11** | 54, 40.5, 26, 19, 18, 16, 15, 14, 12, 11, 10 |
| /people | 390 | **9** | 54, 34, 26, 24.3, 19, 16, 15, 14, 12 |
| /paintings | 390 | 6 | 54, 46, 26, 16, 14, 12 |
| /about | 390 | **10** | 54, 34, 28.6, 26, 22, 19, 16, 15, 14, 12 |
| /404 | 390 | **7** | 54, 34, 19, 16, 15, 14, 12 |
| / | land | 5 | 74.1, 16, 15, 14, 12 |
| /bakery | land | **10** | 74.1, 46, 34, 26, 19, 16, 15, 14, 13, 12 |
| /commissioners-office | land | **10** | 74.1, 46, 34, 26, 19, 16, 15, 14, 13, 12 |
| /mansion | land | **10** | 74.1, 46, 34, 26, 19, 16, 15, 14, 13, 12 |
| /ferry | land | **10** | 74.1, 46, 34, 26, 19, 16, 15, 14, 13, 12 |
| /barbershop | land | **10** | 74.1, 46, 34, 26, 19, 16, 15, 14, 13, 12 |
| /map | land | **11** | 74.1, 46, 26, 22.5, 19, 16, 15, 14, 12.5, 12, 11 |
| /people | land | **9** | 74.1, 46, 34, 26, 19, 16, 15, 14, 12 |
| /paintings | land | 6 | 74.1, 46, 26, 16, 14, 12 |
| /about | land | **10** | 74.1, 46, 34, 26, 22, 19, 16, 15, 14, 12 |
| /404 | land | **7** | 74.1, 34, 19, 16, 15, 14, 12 |
| / | 768 | 5 | 84.5, 16, 15, 14, 12 |
| /bakery | 768 | **11** | 84.5, 64, 46, 32, 28, 20, 16, 15, 14, 13, 12 |
| /commissioners-office | 768 | **11** | 84.5, 64, 46, 32, 28, 20, 16, 15, 14, 13, 12 |
| /mansion | 768 | **11** | 84.5, 64, 46, 32, 28, 20, 16, 15, 14, 13, 12 |
| /ferry | 768 | **12** | 84.5, 64, 59.7, 46, 32, 28, 20, 16, 15, 14, 13, 12 |
| /barbershop | 768 | **11** | 84.5, 64, 46, 32, 28, 20, 16, 15, 14, 13, 12 |
| /map | 768 | **11** | 84.5, 64, 28, 22.5, 20, 16, 15, 14, 12.5, 12, 11 |
| /people | 768 | **9** | 84.5, 47.8, 46, 28, 20, 16, 15, 14, 12 |
| /paintings | 768 | 6 | 84.5, 64, 28, 16, 14, 12 |
| /about | 768 | **10** | 84.5, 56.2, 46, 28, 22, 20, 16, 15, 14, 12 |
| /404 | 768 | **7** | 84.5, 46, 20, 16, 15, 14, 12 |
| / | 1024 | 5 | 112.6, 16, 15, 14, 12 |
| /bakery | 1024 | **11** | 112.6, 64, 46, 32, 28, 20, 16, 15, 14, 13, 12 |
| /commissioners-office | 1024 | **11** | 112.6, 64, 46, 32, 28, 20, 16, 15, 14, 13, 12 |
| /mansion | 1024 | **11** | 112.6, 64, 46, 32, 28, 20, 16, 15, 14, 13, 12 |
| /ferry | 1024 | **12** | 112.6, 64, 57.3, 46, 32, 28, 20, 16, 15, 14, 13, 12 |
| /barbershop | 1024 | **11** | 112.6, 64, 46, 32, 28, 20, 16, 15, 14, 13, 12 |
| /map | 1024 | **10** | 112.6, 64, 28, 27, 20, 16, 15, 14, 12, 11 |
| /people | 1024 | **9** | 112.6, 64, 46, 28, 20, 16, 15, 14, 12 |
| /paintings | 1024 | 6 | 112.6, 64, 28, 16, 14, 12 |
| /about | 1024 | **10** | 112.6, 64, 46, 28, 22.5, 20, 16, 15, 14, 12 |
| /404 | 1024 | **7** | 112.6, 46, 20, 16, 15, 14, 12 |
| / | 1440 | 4 | 128, 16, 15, 13 |
| /bakery | 1440 | **9** | 128, 88, 56, 38, 30, 21, 16, 15, 13 |
| /commissioners-office | 1440 | **9** | 128, 88, 56, 38, 30, 21, 16, 15, 13 |
| /mansion | 1440 | **10** | 128, 88, 82.1, 56, 38, 30, 21, 16, 15, 13 |
| /ferry | 1440 | **10** | 128, 88, 71.9, 56, 38, 30, 21, 16, 15, 13 |
| /barbershop | 1440 | **9** | 128, 88, 56, 38, 30, 21, 16, 15, 13 |
| /map | 1440 | **9** | 128, 88, 30, 27, 21, 16, 15, 13, 11 |
| /people | 1440 | **8** | 128, 81.1, 56, 30, 21, 16, 15, 13 |
| /paintings | 1440 | 6 | 128, 88, 30, 16, 15, 13 |
| /about | 1440 | **8** | 128, 88, 56, 30, 21, 16, 15, 13 |
| /404 | 1440 | 6 | 128, 56, 21, 16, 15, 13 |

## Size → role map (1440) — a size used by two roles is a collision

- **/** — 128px t-wordmark · 16px (a) · 15px t-meta-body+btn · 13px t-meta  ⚠ 1 size(s) shared by >1 role
- **/bakery** — 128px t-wordmark · 88px t-display · 56px t-title · 38px t-quote · 30px t-title-sm · 21px t-prose · 16px (a) · 15px t-meta-body+btn · 13px t-meta+t-spine-sm+btn-sm  ⚠ 2 size(s) shared by >1 role
- **/commissioners-office** — 128px t-wordmark · 88px t-display · 56px t-title · 38px t-quote · 30px t-title-sm · 21px t-prose · 16px (a) · 15px t-meta-body+btn · 13px t-meta+t-spine-sm+btn-sm  ⚠ 2 size(s) shared by >1 role
- **/mansion** — 128px t-wordmark · 88px t-display · 82.1px t-display · 56px t-title · 38px t-quote · 30px t-title-sm · 21px t-prose · 16px (a) · 15px t-meta-body+btn · 13px t-meta+t-spine-sm+btn-sm  ⚠ 2 size(s) shared by >1 role
- **/ferry** — 128px t-wordmark · 88px t-display · 71.9px t-display · 56px t-title · 38px t-quote · 30px t-title-sm · 21px t-prose · 16px (a) · 15px t-meta-body+btn · 13px t-meta+t-spine-sm+btn-sm  ⚠ 2 size(s) shared by >1 role
- **/barbershop** — 128px t-wordmark · 88px t-display · 56px t-title · 38px t-quote · 30px t-title-sm · 21px t-prose · 16px (a) · 15px t-meta-body+btn · 13px t-meta+t-spine-sm+btn-sm  ⚠ 2 size(s) shared by >1 role
- **/map** — 128px t-wordmark · 88px t-display · 30px t-spine+t-title-sm · 27px (p) · 21px t-prose · 16px (a) · 15px btn+(p)+t-meta-body · 13px (p)+t-meta · 11px (p)  ⚠ 3 size(s) shared by >1 role
- **/people** — 128px t-wordmark · 81.1px t-display · 56px t-title · 30px t-spine+t-title-sm · 21px t-prose · 16px (a) · 15px t-meta-body+btn · 13px t-meta  ⚠ 2 size(s) shared by >1 role
- **/paintings** — 128px t-wordmark · 88px t-display · 30px t-title-sm · 16px (a) · 15px t-meta-body · 13px t-meta
- **/about** — 128px t-wordmark · 88px t-display · 56px t-title · 30px t-spine+t-quote · 21px t-prose · 16px (a) · 15px btn+t-meta-body · 13px t-meta  ⚠ 2 size(s) shared by >1 role
- **/404** — 128px t-wordmark · 56px t-title · 21px t-prose · 16px (a) · 15px btn+t-meta-body · 13px t-meta  ⚠ 1 size(s) shared by >1 role

## Section gaps — should quantize to 24 / 72–128 / 128–200 / 260–400

**/bakery**: -3, -900, 1028, 0, 0, 128, 400, 200
**/commissioners-office**: -3, -900, 1028, 0, 128, 0, 0, 128, 400, 200
**/mansion**: -3, -900, 1028, 0, 0, 128, 400, 200
**/ferry**: -3, -900, 1028, 0, 0, 128, 400, 200
**/barbershop**: -3, -900, 1028, 0, 0, 128, 400, 200
**/map**: -900, 1100, 200
**/people**: -357, 557, 200, 200, 200
**/paintings**: -343, 0, 407, 200, 200
**/about**: -259, 459, 200, 200, 200, 200, 400, 200, 200
**/404**: 200

## Multi-line headings (rag/widow candidates, 1440)

- **/bakery** — "HOLEUR'S FASHIONABLE BAKERY" (3 lines/3 words) · "CAPTURED WITH BREAD IN HAND" (2 lines/5 words) · "“Charles Nalle, I hereby arrest you in the nam" (3 lines/15 words) · "HISTORICAL CONTEXT" (2 lines/2 words) · "NOT ALL LAWS ARE MORAL" (2 lines/5 words) · "WHERE TO NEXT" (2 lines/3 words)
- **/commissioners-office** — "COMMISSIONER'S OFFICE" (2 lines/2 words) · "PART 1 — TUBMAN CREATES A CROWD" (2 lines/7 words) · "“If we can get him out into the crowd, we can " (3 lines/17 words) · "“Drag him to the river! Drown him! But don't l" (2 lines/13 words) · "HISTORICAL CONTEXT" (2 lines/2 words) · "WHEN NOT CHALLENGED INJUSTICE THRIVES" (4 lines/5 words) · "WHERE TO NEXT" (2 lines/3 words)
- **/mansion** — "URI GILBERT HOME" (2 lines/3 words) · "HISTORICAL CONTEXT" (2 lines/2 words) · "THE INVISIBLE MATTER AS MUCH AS THE VISIBLE" (3 lines/8 words) · "WHERE TO NEXT" (2 lines/3 words)
- **/ferry** — "WASHINGTON STREET FERRY LANDING" (3 lines/4 words) · "“The crowd was like a lynch mob in reverse.”" (2 lines/9 words) · "HISTORICAL CONTEXT" (2 lines/2 words) · "AUTHORITARIANISM IS PERSISTENT" (2 lines/3 words) · "WHERE TO NEXT" (2 lines/3 words)
- **/barbershop** — "PETER BALTIMORE'S BARBERSHOP" (3 lines/3 words) · "“We also must liberate history and memory. Tra" (3 lines/20 words) · "HISTORICAL CONTEXT" (2 lines/2 words) · "WE ARE RESPONSIBLE FOR JUSTICE" (3 lines/5 words) · "WHERE TO NEXT" (2 lines/3 words)
- **/map** — "FIVE STOPS THROUGH TROY" (2 lines/4 words)
- **/people** — "ONE DAY. A WHOLE CITY'S CAST." (3 lines/6 words) · "MARTIN I. TOWNSEND" (2 lines/3 words) · "BLUCHER HANSBROUGH" (2 lines/2 words) · "DEPUTY U.S. MARSHAL HOLMES" (2 lines/4 words)
- **/paintings** — "THE NALLE SERIES" (2 lines/3 words) · "WASHINGTON STREET FERRY LANDING — NARRATIVE I" (2 lines/7 words) · "WASHINGTON STREET FERRY LANDING — NARRATIVE II" (2 lines/7 words) · "PETER BALTIMORE'S BARBERSHOP — NARRATIVE I" (2 lines/6 words) · "PETER BALTIMORE'S BARBERSHOP — NARRATIVE II" (2 lines/6 words)
- **/about** — "“In Troy, many residents continued to regard h" (8 lines/67 words)
- **/404** — "THIS PAGE ISN'T PART OF THE MEMORIAL" (2 lines/7 words)