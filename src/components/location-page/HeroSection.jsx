import { useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroHeader } from "./HeroHeader";

// Helper function to extract text from React children for alt attributes
const getTextFromChildren = (children) => {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children
      .map((child) => {
        if (typeof child === "string") return child;
        if (child?.props?.children)
          return getTextFromChildren(child.props.children);
        return "";
      })
      .filter(Boolean)
      .join(" ");
  }
  if (children?.props?.children)
    return getTextFromChildren(children.props.children);
  return "";
};

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function HeroSection({ data }) {
  const mediaRef = useRef(null);
  const textContentRef = useRef(null);

  // Use horizontal image/video for desktop, vertical for mobile
  const backgroundImage = isMobile
    ? data.backgroundImage.vertical
    : data.backgroundImage.horizontal;

  // Check if animated video is available
  const animatedVideo = isMobile
    ? data.backgroundImage.animatedVertical
    : data.backgroundImage.animatedHorizontal;

  const hasAnimatedVideo = !!animatedVideo;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: mediaRef.current,
            start: "top top",
            end: "+=100%",
            scrub: 0.5,
            invalidateOnRefresh: false,
          },
        })
        .to(mediaRef.current, { scale: 1.4, borderRadius: 0, marginTop: 0 }, 0)
        .to(textContentRef.current, { y: -200 }, 0);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <div ref={textContentRef} className="flex-none relative z-20">
        <HeroHeader
          chapterNumber={data.chapterNumber}
          title={data.title}
        />{" "}
      </div>
      {hasAnimatedVideo ? (
        <video
          ref={mediaRef}
          src={`/${animatedVideo}`}
          poster={`/${backgroundImage}`}
          autoPlay
          loop
          muted
          playsInline
          className="mt-0 md:mt-6 lg:mt-12 w-full flex-1 max-h-screen bg-neutral-1 rounded-3xl border border-[rgba(105,49,29,1)] object-cover object-center"
        />
      ) : (
        <img
          ref={mediaRef}
          src={backgroundImage}
          alt={getTextFromChildren(data.title)}
          className="mt-0 md:mt-6 lg:mt-12 w-full flex-1 max-h-screen bg-neutral-1 rounded-3xl border border-[rgba(105,49,29,1)] object-cover object-center"
        />
      )}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[var(--color-primary-2)] to-transparent z-10" />
    </div>
  );
}

// linear-gradient(rgba(16, 10, 6, 0.8), rgba(16, 10, 6, 0.8)
