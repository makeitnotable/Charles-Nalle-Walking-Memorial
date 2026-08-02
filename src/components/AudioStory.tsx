import { useEffect, useRef, useState } from "react";

/**
 * The two-state audio player (approved signature #2) with v2's synced
 * narration woven in. Card lifts primary-3 → primary-4 while playing, cover
 * scales 102%, the time pill morphs MM:SS → MM:SS | MM:SS, and a w-72 mini
 * player opacity-swaps in when the main play button scrolls out (legacy
 * AudioPlayerSection.jsx behavior, verbatim values).
 *
 * v3 weave: the narrative paragraphs below ARE the transcript — the paragraph
 * being read carries a soft primary-4 wash; clicking a paragraph seeks the
 * narration; a slim scrub bar rides under the player controls.
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
  /** e.g. "Chapter 1" */
  label: string;
  /** e.g. "Holeur's Fashionable Bakery" */
  subtitle: string;
  duration?: number;
  timings: Timing[] | null;
  /** Scene paragraphs; "@media:<key>" entries become inline paintings */
  paragraphs: string[];
  /** Cover image key (chapter painting), e.g. "horizontal" */
  cover?: string;
  /** "Section N/M" wayfinding label above the narrative */
  sectionLabel?: string;
  /** Two-column desktop paragraphs (ch4/5 pattern) vs single flow */
  columns?: boolean;
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
  if (!isFinite(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function PlayIcon() {
  return (
    <svg width="20" height="22" viewBox="0 0 17 21" fill="none" aria-hidden="true">
      <path
        d="M1 3.65626C1 2.6851 1 2.19951 1.20249 1.93184C1.37889 1.69865 1.64852 1.55435 1.9404 1.53693C2.27544 1.51692 2.67946 1.78627 3.48752 2.32498L14.0031 9.33535C14.6708 9.78048 15.0046 10.003 15.1209 10.2836C15.2227 10.5288 15.2227 10.8044 15.1209 11.0497C15.0046 11.3302 14.6708 11.5528 14.0031 11.9979L3.48752 19.0083C2.67946 19.547 2.27544 19.8163 1.9404 19.7963C1.64852 19.7789 1.37889 19.6346 1.20249 19.4014C1 19.1337 1 18.6482 1 17.677V3.65626Z"
        stroke="#F26835"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="4" height="16" stroke="#F26835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="1" width="4" height="16" stroke="#F26835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AudioStory({
  slug,
  audioSrc,
  label,
  subtitle,
  duration = 0,
  timings,
  paragraphs,
  cover = "horizontal",
  sectionLabel,
  columns = true,
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
  const listRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(duration);
  const [active, setActive] = useState(-1);
  const [miniLatched, setMiniLatched] = useState(false);
  const [mainVisible, setMainVisible] = useState(true);

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

  // Mini player swaps in exactly when the main play button scrolls out
  useEffect(() => {
    const onScroll = () => {
      const b = mainBtnRef.current;
      if (!b) return;
      setMainVisible(b.getBoundingClientRect().top >= 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
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
      a.play()
        .then(() => {
          setPlaying(true);
          setMiniLatched(true);
        })
        .catch(() => setPlaying(false));
    }
  };

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  const timePill = (mini = false) => (
    <div className="relative inline-block overflow-hidden rounded-3xl bg-primary-10 px-3 py-0.5 transition-all duration-300 ease-in-out">
      <div className="relative whitespace-nowrap">
        <span
          className={`inline-block text-[12px] font-medium text-primary-12 ${!playing ? "" : "absolute opacity-0"}`}
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          {fmt(total)}
        </span>
        <span
          className={`inline-block text-[12px] font-medium text-primary-12 ${playing ? "" : "absolute opacity-0"}`}
          style={{ fontFamily: "var(--font-poppins)" }}
          aria-live={mini ? undefined : "off"}
        >
          {fmt(time)} | {fmt(total)}
        </span>
      </div>
    </div>
  );

  const playButton = (mini = false) => (
    <button
      ref={mini ? undefined : mainBtnRef}
      onClick={toggle}
      aria-label={playing ? `Pause narration: ${subtitle}` : `Play narration: ${subtitle}`}
      className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border-2 border-primary-6 bg-primary-4 transition-colors duration-300 hover:border-primary-7 hover:bg-primary-5 active:bg-primary-3 lg:h-18 lg:w-18"
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
    </button>
  );

  // Split paragraphs into two columns at md+ (approved ch1–3 pattern)
  const midpoint = Math.ceil(items.length / 2);
  const col1 = items.slice(0, midpoint);
  const col2 = items.slice(midpoint);

  const renderItem = (item: Item, globalIndex: number) => {
    if (item.type === "media") {
      return (
        <div key={`m-${globalIndex}`} className="frame-2 overflow-hidden">
          <video
            className="h-auto w-full"
            src={base(`media/${slug}/${item.mediaKey}.mp4`)}
            poster={base(`media/${slug}/${item.mediaKey}-poster.jpg`)}
            autoPlay
            loop
            muted
            playsInline
            aria-label={`Animated painting — ${subtitle}`}
          />
        </div>
      );
    }
    const isFirst = item.timingIndex === 0 && globalIndex === 0;
    const isActive = item.timingIndex === active;
    const words = item.html.split(" ");
    return (
      <p
        key={`p-${globalIndex}`}
        data-timing={item.timingIndex}
        onClick={() => seekParagraph(item.timingIndex)}
        className={`type-body cursor-pointer rounded px-1 py-0.5 transition-colors duration-300 ${isActive ? "narration-active" : ""}`}
        title="Tap to hear this passage"
      >
        {isFirst ? (
          <span>
            <span className="first-word" dangerouslySetInnerHTML={{ __html: words[0] }} />
            <span dangerouslySetInnerHTML={{ __html: " " + words.slice(1).join(" ") }} />
          </span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: item.html }} />
        )}
      </p>
    );
  };

  return (
    <div>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* ——— The main player card ——— */}
      <div
        className={`mx-auto rounded-3xl border-2 border-primary-6 transition-colors duration-300 md:w-[29.296rem] lg:w-[32.5rem] ${playing ? "bg-primary-4" : "bg-primary-3"}`}
        style={{
          opacity: mainVisible ? 1 : 0,
          transition: "opacity 300ms ease-in-out, background-color 300ms",
        }}
      >
        <div className="p-4">
          <div
            className={`h-[14.29rem] w-full rounded-xl border-2 border-primary-6 bg-cover bg-center transition-transform duration-300 md:h-[17.86rem] lg:h-[19.66rem] ${playing ? "scale-102" : "scale-100"}`}
            style={{
              backgroundImage: `url('${base(`media/${slug}/${cover}-800.webp`)}')`,
            }}
            role="img"
            aria-label={`Painting — ${subtitle}`}
          />
        </div>
        <div className={`p-4 pt-0 transition-all duration-300 ${playing ? "pb-6" : "pb-4"}`}>
          <div className="flex flex-row items-start justify-between">
            <div className="flex flex-row items-start space-x-2">
              {playButton()}
              <div className="mt-1 ml-2">
                <p className="type-card-title uppercase">{label}</p>
                <p
                  className="mt-1 text-[12px] font-normal text-primary-11"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {subtitle}
                </p>
              </div>
            </div>
            <div className="mt-1.5 mr-1">{timePill()}</div>
          </div>
          {/* Scrub — slim, house colors */}
          <input
            type="range"
            min={0}
            max={Math.max(total, 1)}
            step={1}
            value={time}
            onChange={onScrub}
            aria-label="Narration position"
            className="cnwm-scrub mt-4 w-full"
            style={{
              // played portion primary-9, rest primary-6
              background: `linear-gradient(to right, var(--color-primary-9) ${(time / Math.max(total, 1)) * 100}%, var(--color-primary-6) ${(time / Math.max(total, 1)) * 100}%)`,
            }}
          />
        </div>
      </div>

      {/* Visible affordance for tap-to-seek (never hover-only) */}
      {timings && (
        <p className="type-muted mt-4 text-center">
          Tap any paragraph to hear it read aloud
        </p>
      )}

      {/* ——— The narrative: the transcript is the text ——— */}
      <div ref={listRef} className="mx-auto mt-8 max-w-7xl md:mt-12">
        {sectionLabel && (
          <p className="type-progress py-4 text-neutral-12">{sectionLabel}</p>
        )}
        {columns ? (
          <div className="flex flex-col gap-x-8 gap-y-8 md:grid md:grid-cols-2 lg:gap-y-12">
            <div className="flex flex-col gap-y-8 lg:gap-y-12">
              {col1.map((it, i) => renderItem(it, i))}
            </div>
            <div className="flex flex-col gap-y-8 lg:gap-y-12">
              {col2.map((it, i) => renderItem(it, midpoint + i))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-y-8 lg:gap-y-12">
            {items.map((it, i) => renderItem(it, i))}
          </div>
        )}
      </div>

      {/* ——— Mini player ——— */}
      {miniLatched && (
        <div
          className="fixed right-0 bottom-0 left-0 z-[999] w-full"
          style={{
            opacity: mainVisible ? 0 : 1,
            pointerEvents: mainVisible ? "none" : "auto",
            transition: "opacity 300ms ease-in-out",
          }}
        >
          <div className="mx-auto w-full max-w-7xl p-3">
            <div
              className={`w-72 rounded-2xl border-2 border-primary-6 p-2 shadow-lg transition-colors duration-300 ${playing ? "bg-primary-4" : "bg-primary-3"}`}
            >
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center space-x-2">
                  {playButton(true)}
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-semibold text-primary-12 uppercase">{label}</p>
                    <p
                      className="max-w-[8.5rem] truncate text-[11px] font-normal text-primary-11"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {subtitle}
                    </p>
                  </div>
                </div>
                {timePill(true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
