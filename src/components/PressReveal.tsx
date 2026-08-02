import { useEffect, useRef, useState } from "react";

/**
 * The site's signature interaction: Mark Priest's sketch sits on the surface;
 * press and hold, and the finished painting develops beneath your fingertip,
 * then wakes into its animated version.
 *
 * - Pointer + touch: hold to develop (releasing early lets it fade back)
 * - Keyboard: Enter/Space toggles the reveal (no hold required)
 * - prefers-reduced-motion: click/tap crossfades sketch <-> still painting
 * - Video failure: falls back to the still painting
 */

interface Props {
  slug: string;
  sketch: string;
  video: string;
  videoVertical: string;
  painting: string;
  alt: string;
  /** Fill the parent (the chapter hero frame) instead of owning an aspect box */
  fill?: boolean;
}

const HOLD_MS = 1400;
const DECAY_RATE = 2.2;

function base(path: string): string {
  const b = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${b}/${path}`;
}

export default function PressReveal({
  slug,
  sketch,
  video,
  videoVertical,
  painting,
  alt,
  fill = false,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [locked, setLocked] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const holding = useRef(false);
  const raf = useRef(0);
  const last = useRef(0);
  const progressRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const or = window.matchMedia("(orientation: portrait)");
    setReduced(rm.matches);
    setPortrait(or.matches);
    const onRm = () => setReduced(rm.matches);
    const onOr = () => setPortrait(or.matches);
    rm.addEventListener("change", onRm);
    or.addEventListener("change", onOr);
    return () => {
      rm.removeEventListener("change", onRm);
      or.removeEventListener("change", onOr);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const lock = () => {
    setLocked(true);
    setProgress(1);
    progressRef.current = 1;
    const v = videoRef.current;
    if (v && !videoFailed) {
      v.play().catch(() => setVideoFailed(true));
    }
  };

  const tick = (t: number) => {
    const dt = Math.min(t - last.current, 64) / 1000;
    last.current = t;
    let p = progressRef.current;
    p += holding.current ? dt / (HOLD_MS / 1000) : -dt * DECAY_RATE;
    p = Math.max(0, Math.min(1, p));
    progressRef.current = p;
    setProgress(p);
    if (p >= 1) {
      lock();
      return;
    }
    if (p > 0 || holding.current) raf.current = requestAnimationFrame(tick);
  };

  const startHold = () => {
    if (locked || reduced) return;
    holding.current = true;
    last.current = performance.now();
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
  };
  const endHold = () => {
    holding.current = false;
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (locked) return;
      lock();
    }
  };
  const onClick = () => {
    if (reduced && !locked) lock();
  };

  const videoKey = portrait ? videoVertical : video;
  const showVideo = locked && !reduced && !videoFailed;
  const sketchOpacity = locked ? 0 : 1 - progress * 0.92;
  const revealOpacity = locked ? 1 : progress;

  return (
    <div
      className={
        fill
          ? "press-reveal relative h-full w-full touch-none overflow-hidden select-none"
          : "press-reveal reveal-frame relative aspect-[3/2] w-full touch-none overflow-hidden rounded-sm select-none portrait:aspect-[4/5]"
      }
      role="button"
      tabIndex={0}
      aria-pressed={locked}
      aria-label={
        locked
          ? alt
          : `${alt}. Press and hold to bring the painting to life.`
      }
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      onPointerCancel={endHold}
      onKeyDown={onKey}
      onClick={onClick}
    >
      {/* Finished painting (also the video poster / reduced-motion target) */}
      <img
        src={base(`media/${slug}/${painting}-1440.jpg`)}
        srcSet={`${base(`media/${slug}/${painting}-800.webp`)} 800w, ${base(`media/${slug}/${painting}-1440.webp`)} 1440w`}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: showVideo ? 0 : revealOpacity }}
        draggable={false}
      />

      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={base(`media/${slug}/${videoKey}.mp4`)}
          poster={base(`media/${slug}/${videoKey}-poster.jpg`)}
          muted
          loop
          playsInline
          autoPlay
          onError={() => setVideoFailed(true)}
        />
      )}

      {/* The sketch, dissolving as you hold */}
      <img
        src={base(`media/${slug}/${sketch}-1440.jpg`)}
        srcSet={`${base(`media/${slug}/${sketch}-800.webp`)} 800w, ${base(`media/${slug}/${sketch}-1440.webp`)} 1440w`}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: sketchOpacity,
          filter: `contrast(${1 + progress * 0.15})`,
          transform: `scale(${1 + progress * 0.015})`,
          transition: locked ? "opacity 600ms var(--ease-house)" : undefined,
        }}
        draggable={false}
      />

      {/* Hint + progress */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center px-4 pb-20 sm:pb-8"
        style={{
          opacity: locked ? 0 : 1,
          transition: "opacity 500ms var(--ease-house)",
        }}
      >
        <span
          className="type-label rounded-full px-4 py-2 text-center"
          style={{
            background: "color-mix(in srgb, var(--color-primary-2) 75%, transparent)",
            letterSpacing: "0.14em",
            maxWidth: "min(86vw, 34rem)",
          }}
        >
          {reduced ? "Tap to reveal the painting" : "Press and hold to bring the painting to life"}
        </span>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px]"
        aria-hidden="true"
        style={{
          transformOrigin: "left",
          transform: `scaleX(${revealOpacity})`,
          background: "var(--color-primary-9)",
          opacity: locked ? 0 : 1,
          transition: locked ? "opacity 700ms var(--ease-house)" : undefined,
        }}
      />
    </div>
  );
}
