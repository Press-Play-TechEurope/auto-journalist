"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "~/lib/utils";

/**
 * Cycles through `words`, sliding each new one up into place. The wrapper
 * animates its width to the active word so surrounding text reflows smoothly
 * instead of jumping.
 */
export function RotatingWord({
  words,
  interval = 2200,
  className,
}: {
  words: readonly string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState<number>();
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      interval,
    );
    return () => clearInterval(id);
  }, [words.length, interval]);

  useLayoutEffect(() => {
    const measure = () => setWidth(wordRef.current?.offsetWidth);
    measure();
    // Re-measure if fonts load late or the viewport changes the font size.
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => window.removeEventListener("resize", measure);
  }, [index]);

  const word = words[index] ?? "";

  return (
    <span
      className={cn(
        "inline-block overflow-hidden align-bottom whitespace-nowrap transition-[width] duration-300 ease-out",
        className,
      )}
      style={{ width }}
      aria-live="polite"
    >
      <span
        key={word}
        ref={wordRef}
        className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 inline-block duration-400 ease-out"
      >
        {word}
      </span>
    </span>
  );
}
