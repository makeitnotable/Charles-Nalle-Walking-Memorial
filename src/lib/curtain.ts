/**
 * The curtain page transition (approved signature #1, ported from legacy
 * TransitionOverlay.jsx into MPA form).
 *
 * Legacy choreography: #100A06 panel slides up (0.6s circ.inOut), the
 * CHARLES/NALLE wordmark (or destination name) fades in, 1.0s hold while
 * navigation fires, exits upward (0.6s circ.out).
 *
 * MPA split: page A plays the cover half and navigates once covered; page B
 * (flagged via sessionStorage) starts covered, holds briefly, and plays the
 * exit half. The panel is opaque on both sides of the load, so the seam is
 * invisible. Reduced motion: instant navigation, no curtain.
 */
import gsap from "gsap";

const FLAG = "cnwm-curtain";
const LABEL = "cnwm-curtain-label";

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function els() {
  const panel = document.getElementById("curtain-panel");
  const text = document.getElementById("curtain-text");
  const content = document.getElementById("curtain-text-content");
  return panel && text && content ? { panel, text, content } : null;
}

function setLabel(content: HTMLElement, label: string | null) {
  if (label) {
    content.innerHTML = `<p class="type-wordmark text-center">${label}</p>`;
  } else {
    content.innerHTML = `
      <p class="type-wordmark">Charles</p>
      <p class="type-wordmark self-end" style="margin-top:-0.75rem">Nalle</p>`;
  }
}

/** Cover the page, then run `go` once hidden. */
export function playCover(go: () => void, label: string | null = null) {
  const e = els();
  if (!e || reducedMotion()) {
    go();
    return;
  }
  const { panel, text, content } = e;
  setLabel(content, label);
  panel.style.pointerEvents = "auto";
  sessionStorage.setItem(FLAG, "1");
  sessionStorage.setItem(LABEL, label ?? "");

  gsap.set(panel, { y: "100%" });
  gsap.set(text, { opacity: 0 });
  gsap
    .timeline()
    .to(panel, { y: "0%", duration: 0.6, ease: "circ.inOut" })
    .to(text, { opacity: 1, duration: 0.3, ease: "power2.out" }, "-=0.3")
    // brief settle so the wordmark reads before the load begins
    .to({}, { duration: 0.15, onComplete: go });
}

/** On page B: start covered, hold, exit upward. */
function playExit() {
  const e = els();
  if (!e) return;
  const { panel, text, content } = e;
  const label = sessionStorage.getItem(LABEL) || null;
  sessionStorage.removeItem(FLAG);
  sessionStorage.removeItem(LABEL);

  if (reducedMotion()) return;

  setLabel(content, label);
  panel.style.pointerEvents = "auto";
  gsap.set(panel, { y: "0%" });
  gsap.set(text, { opacity: 1 });
  gsap
    .timeline()
    // hold: the second half of legacy's 1.0s pause (first half absorbed by the load)
    .to({}, { duration: 0.45 })
    .to(text, { opacity: 0, duration: 0.1, ease: "power2.in" })
    .to(
      panel,
      {
        y: "-100%",
        duration: 0.6,
        ease: "circ.out",
        onComplete: () => {
          panel.style.pointerEvents = "none";
          gsap.set(panel, { y: "100%" });
        },
      },
      "<",
    );
}

function isInternalNavClick(a: HTMLAnchorElement, ev: MouseEvent): boolean {
  if (ev.defaultPrevented || ev.button !== 0) return false;
  if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return false;
  if (a.target && a.target !== "_self") return false;
  if (a.hasAttribute("download")) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  // same-page hash jumps don't get a curtain
  if (url.pathname === location.pathname && url.hash) return false;
  return true;
}

export function initCurtain() {
  // Exit half (page B)
  if (sessionStorage.getItem(FLAG)) {
    playExit();
  }

  // bfcache restore: make sure the panel is parked
  window.addEventListener("pageshow", (ev) => {
    if ((ev as PageTransitionEvent).persisted) {
      const e = els();
      if (e) {
        gsap.set(e.panel, { y: "100%" });
        gsap.set(e.text, { opacity: 0 });
        e.panel.style.pointerEvents = "none";
      }
    }
  });

  // Cover half (page A): delegate clicks on internal links
  document.addEventListener("click", (ev) => {
    const a = (ev.target as Element | null)?.closest?.("a");
    if (!a || !(a instanceof HTMLAnchorElement)) return;
    if (!isInternalNavClick(a, ev as MouseEvent)) return;
    if (a.dataset.noCurtain !== undefined) return;
    ev.preventDefault();
    const label = a.dataset.curtainLabel ?? null;
    playCover(() => {
      location.href = a.href;
    }, label);
  });
}
