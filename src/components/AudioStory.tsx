import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ICONS } from "./icons";

/**
 * The narration object — v4.
 *
 * v3 shipped this as a bordered card holding a THIRD copy of the chapter
 * painting, with the transcript split into two ragged columns you cannot
 * follow narration across. v4 unboxes it entirely: a hairline, a circle
 * control, the title, the time, a scrub line. The transcript below is a
 * single serif column on the cream reading register.
 *
 * All the machinery is unchanged and must stay that way: per-paragraph
 * timings drive the sync highlight, tapping a paragraph seeks, and the
 * mini-player latches once playback starts and swaps in when the main
 * control scrolls away. The mini-player now lives bottom-LEFT — the corner
 * menu owns the right on chapter pages.
 */

interface Timing {
  start: number;
  end: number;
}
type Item =
  | { type: "p"; html: string; timingIndex: number }
  | { type: "media"; mediaKey: string };

interface Props {
  slug: string;
  audioSrc: string;
  /** Audio file label, e.g. "Chapter 1 | Pt. 1" (data; not shown as-is) */
  label: string;
  /** What visitors read: "Spot 01" / "Spot 02 · Pt 1" (v7 V7-014 vocabulary) */
  spot?: string;
  /** e.g. "Holeur's Fashionable Bakery" */
  subtitle: string;
  duration?: number;
  timings: Timing[] | null;
  /** Scene paragraphs; "@media:<key>" entries become inline paintings */
  paragraphs: string[];
}

function base(path: string): string {
  const b = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${b}/${path}`;
}

/** Minimal **bold** renderer (content is first-party, not user input). */
function toHtml(p: string): string {
  return (
    p
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      /* v7 G1: glue the last two words so a long final word ("representation.")
         never sits alone on the last line. Whitespace only — the words, and so
         the narration timings, are untouched. */
      .replace(/ (\S+)\s*$/, "\u00a0$1")
  );
}

function fmt(s: number): string {
  if (!isFinite(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

/** The house icon geometry, in React. See src/components/icons.ts. */
function Glyph({ name, className = "icon" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg
      className={name === "play" || name === "arrow" ? `${className} icon-filled` : className}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {ICONS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export default function AudioStory({
  slug,
  audioSrc,
  label,
  spot,
  subtitle,
  duration = 0,
  timings,
  paragraphs,
}: Props) {
  const items: Item[] = [];
  let t = 0;
  for (const p of paragraphs) {
    if (p.startsWith("@media:")) {
      items.push({ type: "media", mediaKey: p.slice("@media:".length) });
    } else {
      items.push({ type: "p", html: toHtml(p), timingIndex: t });
      t++;
    }
  }

  const audioRef = useRef<HTMLAudioElement>(null);
  const mainBtnRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(duration);
  const [active, setActive] = useState(-1);
  const [miniLatched, setMiniLatched] = useState(false);
  const [mainVisible, setMainVisible] = useState(true);
  /* v7 C5: once the transcript has scrolled away (the reader is in the moral /
     Onward), the mini-player collapses to a small pill — one orange less. */
  const [collapsed, setCollapsed] = useState(false);
  /* Phones: while the Onward CTA row is on screen the pill steps aside — the
     one place its lane meets a primary control (juror pass 2, P2). */
  const [ctaInView, setCtaInView] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  /* v7 C9: two islands on one page (Ch2) — only the most recently played one
     keeps its mini-player, and starting one pauses the other. */
  const idRef = useRef(`${slug}-${audioSrc}`);
  /* Buffering on cellular: the control pulses and a live region says why the
     street went quiet. Cleared the moment playback resumes. */
  const [buffering, setBuffering] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      setTime(a.currentTime);
      if (timings) {
        const i = timings.findIndex((x) => a.currentTime >= x.start && a.currentTime < x.end);
        setActive(i);
      }
    };
    const onMeta = () => setTotal(a.duration || duration);
    const onEnd = () => {
      setPlaying(false);
      setActive(-1);
    };
    const onWait = () => setBuffering(true);
    const onGo = () => setBuffering(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    a.addEventListener("waiting", onWait);
    a.addEventListener("stalled", onWait);
    a.addEventListener("playing", onGo);
    a.addEventListener("canplay", onGo);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("waiting", onWait);
      a.removeEventListener("stalled", onWait);
      a.removeEventListener("playing", onGo);
      a.removeEventListener("canplay", onGo);
    };
  }, [timings, duration]);

  // Mini player swaps in exactly when the main control scrolls out
  useEffect(() => {
    const onScroll = () => {
      const b = mainBtnRef.current;
      if (!b) return;
      /* "Visible" = the main control intersects the viewport; a reader above
         a playing Part 2 (Ch2) or scrolled back up needs the pill just as
         much as one below it (juror pass 6). */
      const r = b.getBoundingClientRect();
      setMainVisible(r.bottom > 0 && r.top < window.innerHeight);
      const t = transcriptRef.current;
      if (t) setCollapsed(t.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const row = document.querySelector("#onward .onward-lockup");
    if (!row) return;
    const io = new IntersectionObserver(([e]) => setCtaInView(e.isIntersecting), { threshold: 0 });
    io.observe(row);
    return () => io.disconnect();
  }, []);

  // One narration at a time (v7 C9): another island's play pauses this one
  // and takes the mini-player lane.
  useEffect(() => {
    const onOther = (e: Event) => {
      const who = (e as CustomEvent<string>).detail;
      if (who === idRef.current) return;
      const a = audioRef.current;
      if (a && !a.paused) a.pause();
      setPlaying(false);
      setMiniLatched(false);
    };
    document.addEventListener("cnwm:audio-play", onOther);
    return () => document.removeEventListener("cnwm:audio-play", onOther);
  }, []);
  const announcePlay = () => document.dispatchEvent(new CustomEvent("cnwm:audio-play", { detail: idRef.current }));

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      announcePlay();
      a.play()
        .then(() => {
          setPlaying(true);
          setMiniLatched(true);
        })
        .catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const seekTo = (sec: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = sec;
    setTime(sec);
  };

  const seekParagraph = (timingIndex: number) => {
    if (!timings || !timings[timingIndex]) return;
    seekTo(timings[timingIndex].start + 0.01);
    const a = audioRef.current;
    if (a && a.paused) {
      announcePlay();
      a.play()
        .then(() => {
          setPlaying(true);
          setMiniLatched(true);
        })
        .catch(() => setPlaying(false));
    }
  };

  /* Inline story films load like every other film on the site: after first
     paint, only when near the viewport, and never at all under reduced motion
     or on a metered connection. The poster above each one is the finished
     frame, so nothing is missing if the film never arrives.
     The observer is created on first registration rather than in an effect —
     ref callbacks and effects fire in a fixed order, and depending on it here
     was the difference between working and silently not. */
  const filmIO = useRef<IntersectionObserver | null>(null);
  const filmsOff = useRef<boolean | null>(null);

  const getFilmIO = () => {
    if (filmIO.current) return filmIO.current;
    if (filmsOff.current === null) {
      const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } })
        .connection;
      filmsOff.current =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        Boolean(conn && (conn.saveData || /(^|-)(2g|slow-2g|3g)$/.test(String(conn.effectiveType || ""))));
    }
    if (filmsOff.current) return null;
    filmIO.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const v = e.target as HTMLVideoElement;
          filmIO.current?.unobserve(v);
          if (v.src || !v.dataset.src) continue;
          const poster = v.previousElementSibling as HTMLElement | null;
          v.src = v.dataset.src;
          v.play()
            .then(() => {
              v.style.opacity = "1";
              if (poster) poster.style.opacity = "0";
            })
            .catch(() => {
              /* The poster IS the finished frame — leave it. */
            });
        }
      },
      { rootMargin: "300px" },
    );
    return filmIO.current;
  };

  const registerFilm = (el: HTMLVideoElement | null, src: string) => {
    if (!el || el.dataset.src) return;
    el.dataset.src = src;
    getFilmIO()?.observe(el);
  };

  useEffect(() => () => filmIO.current?.disconnect(), []);

  const pct = (time / Math.max(total, 1)) * 100;

  /* Tabular figures + a reserved min-width: the v3 pill clipped its last
     digit whenever the elapsed time gained a character. */
  const timeReadout = (
    <span
      className="t-meta"
      style={{
        fontVariantNumeric: "tabular-nums",
        minWidth: playing ? "11ch" : "5ch",
        display: "inline-block",
        textAlign: "right",
        letterSpacing: "0.06em",
      }}
    >
      {playing ? `${fmt(time)} / ${fmt(total)}` : fmt(total)}
    </span>
  );

  const playButton = (mini = false) => (
    <button
      ref={mini ? undefined : mainBtnRef}
      onClick={toggle}
      aria-label={`${playing ? "Pause" : "Play"} narration: ${subtitle}${spot && spot.includes("Pt") ? `, ${spot.split("·").pop()?.trim()}` : ""}`}
      className={`flex shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
        mini ? "h-11 w-11" : "h-14 w-14"
      } ${
        playing
          ? "border-primary-9 bg-primary-9 text-primary-2"
          : "border-primary-10 bg-primary-10 text-primary-2 hover:border-primary-9 hover:bg-primary-9"
      } ${buffering && playing ? "animate-pulse" : ""}`}
      style={{ transitionDuration: "var(--dur-fast)", transitionTimingFunction: "var(--ease)" }}
    >
      <Glyph name={playing ? "pause" : "play"} className={mini ? "icon icon-sm" : "icon"} />
      {!mini && (
        <span aria-live="polite" className="sr-only">
          {buffering && playing ? "Narration is buffering" : ""}
        </span>
      )}
    </button>
  );

  const renderItem = (item: Item, globalIndex: number) => {
    if (item.type === "media") {
      /* Final review (2026-08-07), Wil's own note: the in-narrative paintings
         ran the full transcript column — the vertical canvases especially were
         "a little bit too big." The box now fits the image, capped at 64vh, so
         a portrait plate no longer owns two screens of scroll. */
      return (
        <div key={`m-${globalIndex}`} className="artifact relative mx-auto my-10 w-fit">
          <picture>
            <source type="image/avif" srcSet={base(`media/${slug}/${item.mediaKey}-poster-800.avif`)} />
            <source type="image/webp" srcSet={base(`media/${slug}/${item.mediaKey}-poster-800.webp`)} />
            <img
              className="story-film-poster max-h-[64vh] w-auto max-w-full transition-opacity"
              style={{ transitionDuration: "var(--dur-slow)" }}
              src={base(`media/${slug}/${item.mediaKey}-poster.jpg`)}
              alt={`Animated painting, ${subtitle}`}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <video
            ref={(el) => registerFilm(el, base(`media/${slug}/${item.mediaKey}.mp4`))}
            className="story-film absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity"
            style={{ transitionDuration: "var(--dur-slow)" }}
            preload="none"
            loop
            muted
            playsInline
            aria-hidden="true"
          />
        </div>
      );
    }
    const isActive = item.timingIndex === active;
    /* v7 C1: the first paragraph of each part opens on a storybook drop cap
       (::first-letter, CSS) — the enlarged first WORD device of v5 was cut as
       half-committed; a proper three-line initial commits. */
    return (
      <p
        key={`p-${globalIndex}`}
        data-timing={item.timingIndex}
        onClick={() => seekParagraph(item.timingIndex)}
        className={`t-prose cursor-pointer ${globalIndex === 0 ? "drop-cap" : ""} ${isActive ? "narration-active" : ""}`}
        title="Tap to hear this passage"
      >
        <span dangerouslySetInnerHTML={{ __html: item.html }} />
      </p>
    );
  };

  return (
    <div>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* ——— The narration object: a hairline, a control, a time. No box. ——— */}
      <div
        className="rule-top pt-5 transition-opacity"
        style={{ opacity: mainVisible ? 1 : 0, transitionDuration: "var(--dur-fast)" }}
      >
        <div className="flex items-center gap-5">
          {playButton()}
          <div className="min-w-0 flex-1">
            <p className="t-meta">{buffering && playing ? "Buffering…" : playing ? "Now playing" : "Listen"}</p>
            {/* phones: two lines rather than `Holeur’s Fashionable B…` (juror pass 8) */}
            <p className="t-meta-body mt-1 max-sm:line-clamp-2 sm:truncate">
              {subtitle}
              {spot && spot.includes("Pt") ? ` · ${spot.split("·").pop()?.trim()}` : ""}
            </p>
          </div>
          {timeReadout}
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(total, 1)}
          step={1}
          value={time}
          onChange={(e) => seekTo(Number(e.target.value))}
          aria-label="Narration position"
          className="cnwm-scrub mt-4 w-full"
          /* v7 V7-010: the played fraction rides a custom property; a `var()`
             gradient in the style object tripped React's style-hydration diff
             (server `background-image` vs client `backgroundImage`) — the
             intermittent console error on chapters. */
          style={{ "--pct": `${pct}%` } as CSSProperties}
        />
      </div>

      {/* ——— The transcript: one serif column on the cream register ——— */}
      <div ref={transcriptRef} className="ground-cream bleed mt-12 py-16 md:py-24">
        <div className="mx-auto w-full max-w-[var(--shell)] px-[var(--gutter)]">
          {timings && <p className="t-meta mb-8">Tap or click a paragraph to hear it read aloud</p>}
          <div className="flex flex-col gap-y-8">{items.map((it, i) => renderItem(it, i))}</div>
        </div>
      </div>

      {/* ——— Mini player — bottom LEFT; the corner menu owns the right ——— */}
      {miniLatched && (
        <div
          className="fixed bottom-[var(--ui-inset)] left-[var(--ui-inset)] z-[999]"
          style={{
            opacity: mainVisible ? 0 : 1,
            pointerEvents: mainVisible ? "none" : "auto",
            transition: "opacity var(--dur-fast) var(--ease)",
          }}
        >
          {/* Phones: while the Onward CTA row is on screen the pill shrinks to the
              round play/pause button so it never covers a centred CTA — and it
              never disappears while narration plays (juror pass 3). */}
          <div
            className={`flex items-center gap-3 rounded-full py-2 pl-2 ${collapsed ? "pr-4" : "pr-5"} ${ctaInView ? "max-sm:gap-0 max-sm:p-1 max-sm:pr-1" : ""}`}
            style={{
              background: "color-mix(in srgb, var(--color-primary-2) 88%, transparent)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--color-primary-7)",
              transition: "padding var(--dur-fast) var(--ease)",
            }}
          >
            {playButton(true)}
            <div className={`min-w-0 ${ctaInView ? "max-sm:hidden" : ""}`}>
              {!collapsed && <p className="t-meta truncate">{spot ?? label}</p>}
              <p
                className={`t-meta-body truncate ${collapsed ? "" : "mt-0.5"}`}
                style={{ fontVariantNumeric: "tabular-nums", fontSize: "12px" }}
              >
                {collapsed ? fmt(time) : `${fmt(time)} / ${fmt(total)}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
