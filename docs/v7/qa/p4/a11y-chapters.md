# Accessibility — http://localhost:4321

**0 serious/critical · 0 moderate · 0 minor across 14 runs** (0 run(s) not reached · 2026-08-16T02:14:06.914Z)

## Violations

No axe violations.

## Keyboard walk

- **/bakery @1440** — 16 stops (focus returned to body); 0 WITHOUT a visible ring
- **/mansion menu @1440** — Enter opens: true · focus into panel: true · Escape closes: true · focus returned to burger: true
- **/bakery @390** — 12 stops (focus returned to body); 0 WITHOUT a visible ring
- **/mansion menu @390** — Enter opens: true · focus into panel: true · Escape closes: true · focus returned to burger: true

## Reduced motion

- **/bakery @390** — all text visible; 0 console error(s)
- **/commissioners-office @390** — all text visible; 0 console error(s)
- **/mansion @390** — all text visible; 0 console error(s)
- **/ferry @390** — all text visible; 0 console error(s)
- **/barbershop @390** — all text visible; 0 console error(s)
- **/bakery @1440** — all text visible; 0 console error(s)
- **/commissioners-office @1440** — all text visible; 0 console error(s)
- **/mansion @1440** — all text visible; 0 console error(s)
- **/ferry @1440** — all text visible; 0 console error(s)
- **/barbershop @1440** — all text visible; 0 console error(s)

## 200% zoom (720×450)

- **/bakery** — no horizontal overflow
- **/commissioners-office** — no horizontal overflow
- **/mansion** — no horizontal overflow
- **/ferry** — no horizontal overflow
- **/barbershop** — no horizontal overflow

## Console errors

- `/bakery @1440 keyboard` — A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:  - A server/client branch `if (typeof window !== 'undefined')`. - Variable input such as `Date.now()` or `Math.random()` wh
