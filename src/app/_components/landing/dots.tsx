import { cn } from "~/lib/utils";

type Dot = { x: number; y: number; o: number; r: number };

/** Deterministic pseudo-noise so the "continents" look organic but never change between renders. */
function noise(a: number, b: number) {
  return (
    Math.sin(a * 0.09 + 1.3) * Math.cos(b * 0.05 + a * 0.03) +
    Math.sin(b * 0.11 - a * 0.07) * 0.6 +
    Math.cos(a * 0.21 + b * 0.17) * 0.25
  );
}

/**
 * A halftone globe — rings of dots on an orthographic projection, with a noise
 * field picking "land" (bright) vs "ocean" (faint) dots.
 */
export function DotGlobe({ className }: { className?: string }) {
  const W = 900;
  const H = 900;
  const R = 400;
  const cx = W / 2;
  const cy = H / 2;
  const dots: Dot[] = [];

  for (let lat = -88; lat <= 88; lat += 3.2) {
    const phi = (lat * Math.PI) / 180;
    const ring = Math.cos(phi);
    const count = Math.max(1, Math.round(118 * ring));
    for (let i = 0; i < count; i++) {
      const lon = (i / count) * 360 - 160;
      const lam = (lon * Math.PI) / 180;
      const x = ring * Math.sin(lam);
      const z = ring * Math.cos(lam);
      const y = Math.sin(phi);
      if (z < 0.02) continue;
      const land = noise(lat, lon) > 0.2;
      const depth = 0.3 + 0.7 * z;
      dots.push({
        x: cx + x * R,
        y: cy - y * R,
        o: (land ? 0.72 : 0.14) * depth,
        r: land ? 2.1 : 1.5,
      });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
      className={cn("pointer-events-none select-none", className)}
    >
      <defs>
        <radialGradient id="pp-globe-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#2563eb" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={R + 40} fill="url(#pp-globe-glow)" />
      <g fill="#ffffff">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
        ))}
      </g>
    </svg>
  );
}

/** A dotted hourglass / funnel used in the stat band. */
export function DotHourglass({ className }: { className?: string }) {
  const cols = 72;
  const rows = 34;
  const W = 720;
  const H = 340;
  const dots: Dot[] = [];
  for (let j = 0; j < rows; j++) {
    const ny = (j / (rows - 1)) * 2 - 1;
    for (let i = 0; i < cols; i++) {
      const nx = (i / (cols - 1)) * 2 - 1;
      const limit = 0.08 + 0.92 * Math.abs(ny) ** 1.3;
      if (Math.abs(nx) > limit) continue;
      const edge = 1 - Math.abs(nx) / limit;
      const jitter = 0.5 + 0.5 * Math.abs(Math.sin(i * 12.9898 + j * 78.233));
      const o = Math.min(1, 0.25 + edge * 0.6) * (0.55 + 0.45 * jitter);
      dots.push({
        x: 10 + ((i + 0.5) / cols) * (W - 20),
        y: 10 + ((j + 0.5) / rows) * (H - 20),
        o,
        r: 1.8,
      });
    }
  }
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
      className={cn("pointer-events-none select-none", className)}
    >
      <g fill="#ffffff">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
        ))}
      </g>
    </svg>
  );
}

/** Faint dot grid used as a section texture. */
export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(15,23,42,0.14)_1px,transparent_1.2px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] bg-[size:22px_22px]",
        className,
      )}
    />
  );
}

/** The 3×3 dotted mark used in the footer wordmark. */
export function DotMark({ className }: { className?: string }) {
  const pts = [
    [1, 0],
    [0, 1],
    [2, 1],
    [1, 2],
    [1, 1],
  ];
  return (
    <svg viewBox="0 0 3 3" aria-hidden className={className}>
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x! + 0.5}
          cy={y! + 0.5}
          r={i === 4 ? 0.34 : 0.26}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
