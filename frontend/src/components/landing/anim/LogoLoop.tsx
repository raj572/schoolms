import React, { useRef, useEffect } from "react";

export type LogoItem = {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
};

type LogoLoopProps = {
  logos?: LogoItem[] | LogoItem; // accept array, single item, or undefined
  speed?: number; // pixels per second
  gap?: number; // gap between logos in px
  className?: string;
  gradientEnabled?: boolean;
  gradientStops?: string; // custom mask gradient stops (CSS value)
};



export default function LogoLoop({
  logos,
  speed = 60,
  gap = 24,
  className = "",
  gradientEnabled = true,
  gradientStops = "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)",
}: LogoLoopProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const isPausedRef = useRef(false);

  // Normalize logos prop: allow undefined, single item, or array
  const logosArray: LogoItem[] = React.useMemo(() => {
    if (!logos) return [];
    if (Array.isArray(logos)) return logos.filter(Boolean) as LogoItem[];
    return [logos as LogoItem];
  }, [logos]);

  // if there are no logos, render nothing (or you can render a placeholder)
  if (logosArray.length === 0) {
    return null;
  }

  // duplicate logos array so we can seamlessly scroll
  const logosToRender = [...logosArray, ...logosArray];

  // compute total width of the single set after mount
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // reset position
    posRef.current = 0;

    let last = performance.now();

    function step(now: number) {
      if (isPausedRef.current) {
        last = now;
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const dt = now - last;
      last = now;

      const px = (speed * dt) / 1000;
      posRef.current -= px;

      // width of one set (half of children because we duplicated)
      const singleWidth = (track.scrollWidth / 2) || 1;

      // wrap around
      if (Math.abs(posRef.current) >= singleWidth) {
        posRef.current += singleWidth;
      }

      track.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [logosArray, speed]);

  

  // mask styles (with -webkit- fallback) — applied to the outer container to create fade at edges
  const maskStyle = gradientEnabled
    ? {
        WebkitMaskImage: gradientStops,
        maskImage: gradientStops,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }
    : {};

  return (
    <div
      className={`w-full max-w-4xl overflow-hidden select-none relative ${className}`}
      aria-hidden={false}
      style={{ ...maskStyle }}
    >
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap will-change-transform"
        style={{ gap: `${gap}px`, transform: "translateX(0)" }}
      >
        {logosToRender.map((logo, idx) => (
          <div
            key={`${logo.src}-${idx}`}
            className="flex-shrink-0 flex items-center justify-center"
            style={{ padding: 0 }}
            aria-hidden={idx >= logosArray.length}
          >
            <img
              src={logo.src}
              alt={logo.alt ?? "logo"}
              width={logo.width ?? 120}
              height={logo.height ?? 32}
              decoding="async"
              style={{
                display: "block",
                width: typeof logo.width === "number" ? `${logo.width}px` : logo.width || "120px",
                height:
                  typeof logo.height === "number" ? `${logo.height}px` : logo.height || "32px",
                objectFit: "contain",
                objectPosition: "center",
                opacity: 1,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
