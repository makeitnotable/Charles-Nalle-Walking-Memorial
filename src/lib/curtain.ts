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
const DATE = "cnwm-curtain-date";
/** The film over-title (elevation C13): chapter navigations carry the day. */
const DATE_LINE = "April 27, 1860";

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The set-piece duration lives in CSS (`--dur-curtain`, v7 G7). */
function curtainDur(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--dur-curtain").trim();
  const ms = raw.endsWith("ms") ? parseFloat(raw) : raw.endsWith("s") ? parseFloat(raw) * 1000 : NaN;
  return Number.isFinite(ms) && ms > 0 ? ms / 1000 : 0.6;
}

/** v7 X1: the curtain announces itself so live islands (the map's camera and
 *  route-draw, the museum's render loop and video) go quiet under the cover. */
export const CURTAIN_COVER_EVENT = "cnwm:curtain-cover";

function els() {
  const panel = document.getElementById("curtain-panel");
  const text = document.getElementById("curtain-text");
  const content = document.getElementById("curtain-text-content");
  return panel && text && content ? { panel, text, content } : null;
}

function setLabel(content: HTMLElement, label: string | null, withDate = false) {
  if (label && withDate) {
    // The Crossing (v6): the DAY is the protagonist — broadside register,
    // the destination subordinate beneath it.
    content.innerHTML =
      `<p class="t-crossing text-center">${DATE_LINE}</p>` +
      `<p class="t-meta text-center" style="margin-top:1.25rem">${label}</p>`;
  } else if (label) {
    /* v9 V9-302 (Wil, 8/21): a label may carry authored line breaks — "The\n
       Paintings" paints as two lines, the same way `name.display` authors the
       chapter heroes. One <p> per line, all centred. */
    content.innerHTML = label
      .split("\n")
      .map((line) => `<p class="t-wordmark text-center">${line}</p>`)
      .join("");
  } else {
    content.innerHTML = `
      <p class="t-wordmark">Charles</p>
      <p class="t-wordmark self-end" style="margin-top:-0.06em">Nalle</p>`;
  }
}

/** Cover the page, then run `go` once hidden. */
export function playCover(
  go: () => void,
  label: string | null = null,
  withDate = false,
) {
  const e = els();
  if (!e || reducedMotion()) {
    go();
    return;
  }
  const { panel, text, content } = e;
  document.dispatchEvent(new CustomEvent(CURTAIN_COVER_EVENT));
  setLabel(content, label, withDate);
  panel.style.pointerEvents = "auto";
  panel.style.willChange = "transform";
  sessionStorage.setItem(FLAG, "1");
  sessionStorage.setItem(LABEL, label ?? "");
  sessionStorage.setItem(DATE, withDate ? "1" : "");

  const dur = curtainDur();
  gsap.set(panel, { y: "100%" });
  gsap.set(text, { opacity: 0 });
  gsap
    .timeline()
    .to(panel, { y: "0%", duration: dur, ease: "circ.inOut" })
    .to(text, { opacity: 1, duration: 0.3, ease: "power2.out" }, "-=0.3")
    // brief settle so the wordmark reads before the load begins
    .to({}, { duration: 0.15, onComplete: go });

  // Fail-open (guardrail F2): if navigation never happens — blocked popup,
  // JS error, hung load — the curtain must never hold the page hostage.
  // Two benchmark sites brick exactly this way; we refuse to.
  window.setTimeout(() => {
    if (!document.hidden && sessionStorage.getItem(FLAG)) {
      sessionStorage.removeItem(FLAG);
      sessionStorage.removeItem(LABEL);
      gsap.to(text, { opacity: 0, duration: 0.1 });
      gsap.to(panel, {
        y: "-100%",
        duration: 0.4,
        ease: "circ.out",
        onComplete: () => {
          panel.style.pointerEvents = "none";
          gsap.set(panel, { y: "100%" });
          requestAnimationFrame(() => (panel.style.willChange = ""));
        },
      });
    }
  }, 4000);
}

/** On page B: start covered, hold, exit upward. */
function playExit() {
  const e = els();
  if (!e) return;
  const { panel, text, content } = e;
  const label = sessionStorage.getItem(LABEL) || null;
  const withDate = Boolean(sessionStorage.getItem(DATE));
  sessionStorage.removeItem(FLAG);
  sessionStorage.removeItem(LABEL);
  sessionStorage.removeItem(DATE);

  if (reducedMotion()) {
    document.documentElement.classList.remove("curtain-covered");
    return;
  }

  /* v7 X1: the inline head script already painted the panel covered and the
     label written (`.curtain-covered`); take the same state over as inline
     styles, then release the class so nothing fights the tween. */
  setLabel(content, label, withDate);
  panel.style.pointerEvents = "auto";
  panel.style.willChange = "transform";
  gsap.set(panel, { y: "0%" });
  gsap.set(text, { opacity: 1 });
  document.documentElement.classList.remove("curtain-covered");
  const dur = curtainDur();
  gsap
    .timeline()
    // hold: the second half of legacy's 1.0s pause (first half absorbed by the load)
    .to({}, { duration: 0.45 })
    .to(text, { opacity: 0, duration: 0.1, ease: "power2.in" })
    .to(
      panel,
      {
        y: "-100%",
        duration: dur,
        ease: "circ.out",
        onComplete: () => {
          panel.style.pointerEvents = "none";
          gsap.set(panel, { y: "100%" });
          requestAnimationFrame(() => (panel.style.willChange = ""));
        },
      },
      "<",
    );

  // Fail-open: never let a stalled exit hold page B hostage.
  window.setTimeout(() => {
    if (panel.style.pointerEvents === "auto") {
      panel.style.pointerEvents = "none";
      panel.style.willChange = "";
      document.documentElement.classList.remove("curtain-covered");
      gsap.set(panel, { y: "100%" });
      gsap.set(text, { opacity: 0 });
    }
  }, 3000);
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
  } else {
    // A stale `.curtain-covered` (flag consumed elsewhere) must never linger.
    document.documentElement.classList.remove("curtain-covered");
  }

  // bfcache restore: make sure the panel is parked
  window.addEventListener("pageshow", (ev) => {
    if ((ev as PageTransitionEvent).persisted) {
      const e = els();
      document.documentElement.classList.remove("curtain-covered");
      if (e) {
        gsap.set(e.panel, { y: "100%" });
        gsap.set(e.text, { opacity: 0 });
        e.panel.style.pointerEvents = "none";
        e.panel.style.willChange = "";
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
    const withDate = a.dataset.curtainDate !== undefined;
    playCover(
      () => {
        location.href = a.href;
      },
      label,
      withDate,
    );
  });
}
