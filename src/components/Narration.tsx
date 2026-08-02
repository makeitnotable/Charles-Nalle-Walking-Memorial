import { useEffect, useRef, useState } from "react";

/**
 * Narrated scene: a custom audio player whose playback illuminates the
 * paragraph being read (word-proportional timings until exact stamps land).
 * The text IS the transcript — always visible, never behind a toggle.
 * Clicking a paragraph seeks the narration to it.
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
  label: string;
  subtitle: string;
  duration?: number;
  timings: Timing[] | null;
  /** Scene paragraphs; "@media:<key>" entries become inline paintings */
  paragraphs: string[];
  cardTitle: string;
}

function base(path: string): string {
  const b = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${b}/${path}`;
}

/** Minimal **bold** renderer (content is first-party, not user input). */
function toHtml(p: string): string {
  return p
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function Narration({
  slug,
  audioSrc,
  label,
  subtitle,
  duration = 0,
  timings,
  paragraphs,
  cardTitle,
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
  const listRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(duration);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      setTime(a.currentTime);
      if (timings) {
        const i = timings.findIndex(
          (x) => a.currentTime >= x.start && a.currentTime < x.end,
        );
        setActive(i);
      }
    };
    const onMeta = () => setTotal(a.duration || duration);
    const onEnd = () => {
      setPlaying(false);
      setActive(-1);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, [timings, duration]);

  // Keep the illuminated paragraph comfortably in view while narrating
  useEffect(() => {
    if (active < 0 || !playing) return;
    const el = listRef.current?.querySelector(`[data-timing="${active}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active, playing]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const seekTo = (i: number) => {
    const a = audioRef.current;
    if (!a || !timings?.[i]) return;
    a.currentTime = timings[i].start + 0.01;
    if (a.paused) {
      a.play();
      setPlaying(true);
    }
  };

  const scrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = parseFloat(e.target.value);
    setTime(a.currentTime);
  };

  return (
    <div>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* Player */}
      <div
        className="sticky top-3 z-20 rounded-md border border-white/12 px-4 py-3 backdrop-blur-md"
        style={{
          background:
            "color-mix(in oklab, var(--chapter-surface) 82%, transparent)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? `Pause narration: ${label}` : `Play narration: ${label}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full transition-transform hover:scale-105"
            style={{ background: "var(--chapter-accent)", color: "var(--chapter-surface)" }}
          >
            {playing ? (
              <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
                <rect width="4.5" height="16" fill="currentColor" />
                <rect x="9.5" width="4.5" height="16" fill="currentColor" />
              </svg>
            ) : (
              <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
                <path d="M0 0 L14 8 L0 16 Z" fill="currentColor" />
              </svg>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="label-caps truncate">
              Listen · {label} — {subtitle}
            </p>
            <div className="mt-1.5 flex items-center gap-3">
              <span className="text-xs tabular-nums opacity-70">{fmt(time)}</span>
              <input
                type="range"
                min={0}
                max={total || 1}
                step={0.1}
                value={time}
                onChange={scrub}
                aria-label="Narration position"
                className="narration-range h-1 w-full cursor-pointer appearance-none rounded-full"
                style={{
                  background: `linear-gradient(90deg, var(--chapter-accent) ${
                    total ? (time / total) * 100 : 0
                  }%, color-mix(in oklab, var(--chapter-ink) 25%, transparent) 0)`,
                }}
              />
              <span className="text-xs tabular-nums opacity-70">{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* The story — transcript and text are one and the same */}
      <div ref={listRef} className="prose-narrative mt-8">
        {items.map((item, idx) =>
          item.type === "media" ? (
            <InlineVideo key={idx} slug={slug} mediaKey={item.mediaKey} cardTitle={cardTitle} />
          ) : (
            <p
              key={idx}
              data-timing={item.timingIndex}
              onClick={() => seekTo(item.timingIndex)}
              className={`${item.timingIndex === 0 ? "drop-cap " : ""}cursor-pointer ${
                active === item.timingIndex ? "narration-active" : ""
              }`}
              title="Read this passage aloud"
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
          ),
        )}
      </div>
    </div>
  );
}

function InlineVideo({
  slug,
  mediaKey,
  cardTitle,
}: {
  slug: string;
  mediaKey: string;
  cardTitle: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <figure className="my-10">
      <video
        ref={ref}
        className="w-full rounded-sm border border-white/10"
        src={base(`media/${slug}/${mediaKey}.mp4`)}
        poster={base(`media/${slug}/${mediaKey}-poster.jpg`)}
        muted
        loop
        playsInline
        preload="none"
        aria-label={`Animated painting by Mark Priest — ${cardTitle}`}
      />
    </figure>
  );
}
