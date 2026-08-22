import { Clapperboard, Mic, Newspaper, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";

import { Logo } from "~/components/logo";

import {
  DotGlobe,
  DotGrid,
  DotHourglass,
  DotMark,
} from "./_components/landing/dots";
import {
  AskMock,
  PresenterOrbit,
  ProductMock,
  ReadMock,
  WriteMock,
} from "./_components/landing/mocks";
import { RotatingWord } from "./_components/landing/rotating-word";

const EXPLAIN_TOPICS = [
  "tech",
  "AI",
  "policy",
  "hardware",
  "space",
  "science",
  "finance",
  "crypto",
] as const;

const NAV = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#presenters", label: "Presenters" },
];

/* Shared pieces ---------------------------------------------------------- */

function Eyebrow({
  icon: Icon,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ${className ?? ""}`}
    >
      <Icon className="size-3 text-blue-600" />
      {children}
    </span>
  );
}

function PillLink({
  href,
  children,
  tone = "dark",
  className,
}: {
  href: string;
  children: React.ReactNode;
  tone?: "dark" | "lime" | "light" | "ghost";
  className?: string;
}) {
  const tones = {
    dark: "bg-slate-900 text-white hover:bg-slate-800",
    lime: "bg-brand-lime text-slate-900 hover:bg-brand-lime-bright shadow-[0_10px_30px_-10px_rgba(223,242,74,0.8)]",
    light: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    ghost: "text-white/90 hover:text-white",
  };
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-colors ${tones[tone]} ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

/* Page ------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white text-slate-900 antialiased">
      {/* ============================== HERO ============================== */}
      <section className="relative isolate overflow-hidden bg-[#020617] text-white">
        {/* Sky gradient: near-black → cobalt → bright blue → white */}
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#020617_0%,#0b1a5c_28%,#1d4ed8_58%,#3b82f6_76%,#93c5fd_88%,#ffffff_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_50%_60%,rgba(96,165,250,0.35),transparent_70%)]"
        />
        <DotGlobe className="absolute top-[-6%] left-1/2 -z-10 h-[min(120vw,980px)] w-[min(120vw,980px)] -translate-x-1/2 [mask-image:linear-gradient(180deg,black_55%,transparent_92%)] opacity-90 sm:top-[-14%]" />
        {/* Soft vignette so the headline stays legible over the dots */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-24 -z-10 h-[28rem] bg-[radial-gradient(40%_60%_at_50%_45%,rgba(6,20,80,0.55),transparent_70%)]"
        />

        {/* Nav */}
        <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-white text-slate-900">
              <Logo className="size-3.5" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Press Play
            </span>
          </Link>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 text-[13px] text-white/80 md:flex">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center">
            <Link
              href="/login"
              className="inline-flex h-8 items-center rounded-full bg-white px-3.5 text-[13px] font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Log in
            </Link>
          </div>
        </header>

        {/* Hero copy */}
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-14 pb-48 text-center sm:px-6 sm:pt-20 sm:pb-64">
          <h1 className="animate-in fade-in slide-in-from-bottom-3 max-w-3xl font-serif text-[44px] leading-[1.02] tracking-[-0.02em] text-balance delay-100 duration-500 sm:text-7xl">
            Post about today&rsquo;s news without filming today
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 mt-6 max-w-lg text-[15px] leading-relaxed text-balance text-white/75 delay-200 duration-500 sm:text-base">
            Press Play pulls the stories from your feeds, writes the script and
            the caption, and renders a subtitled talking-head video — with your
            face or one of ours. You just hit post.
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-5 mt-8 delay-300 duration-500">
            <PillLink href="/feed" tone="lime">
              Open your newsroom
            </PillLink>
          </div>
        </div>
      </section>

      {/* ======================== POST MORE, FILM LESS ==================== */}
      <section
        id="how-it-works"
        className="relative mx-auto w-full max-w-6xl px-4 pt-8 pb-24 sm:px-6 sm:pt-12"
      >
        <h2 className="font-serif text-[34px] leading-tight tracking-tight sm:text-5xl">
          Post more, film less
        </h2>
        <p className="mt-3 max-w-md text-[15px] text-slate-500">
          Press Play keeps your channel{" "}
          <span className="text-slate-900">current</span> without the research
          rabbit hole, the script writing or the reshoots.
        </p>

        <div className="relative mt-12">
          <DotGrid className="-inset-x-10 -inset-y-16 opacity-70" />
          <div className="relative">
            <ProductMock />
          </div>
        </div>

        {/* Single-line feature with CTA */}
        <div className="mt-12 flex flex-col items-start gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center">
          <span className="flex size-7 items-center justify-center rounded-md bg-amber-100 text-amber-600">
            <Newspaper className="size-3.5" />
          </span>
          <p className="max-w-md text-[15px] text-slate-600">
            <span className="text-slate-900">Never run dry.</span> Every feed
            you follow becomes a queue of stories worth a video, sorted by what
            just dropped.
          </p>
          <PillLink href="/feed" tone="light" className="sm:ml-auto">
            See the feed
          </PillLink>
        </div>

        {/* Read / Write */}
        <div className="mt-16 grid gap-12 sm:grid-cols-2 sm:gap-8">
          <div>
            <div className="flex items-center gap-2 text-[13px] font-medium">
              <span className="flex size-5 items-center justify-center rounded bg-emerald-100 text-emerald-600">
                <Newspaper className="size-3" />
              </span>
              Read
            </div>
            <h3 className="mt-2 font-serif text-2xl tracking-tight">
              We read the feeds so you can post
            </h3>
            <p className="mt-2 max-w-sm text-[14px] text-slate-500">
              Add the sources your audience cares about. We pull the articles,
              the images and the context, then line up the ones worth your next
              post.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white">
              <ReadMock />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[13px] font-medium">
              <span className="flex size-5 items-center justify-center rounded bg-blue-100 text-blue-600">
                <Wand2 className="size-3" />
              </span>
              Write
            </div>
            <h3 className="mt-2 font-serif text-2xl tracking-tight">
              The script and the caption, already written
            </h3>
            <p className="mt-2 max-w-sm text-[14px] text-slate-500">
              Dense press release in, 45-second script and social caption out —
              in your tone, at your length. Edit a line, regenerate, done.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white">
              <WriteMock />
            </div>
          </div>
        </div>
      </section>

      {/* =========================== STAT BAND =========================== */}
      <section className="relative isolate overflow-hidden text-white">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#ffffff_0%,#bfdbfe_10%,#2563eb_30%,#0b1a5c_62%,#020617_100%)]"
        />
        <DotHourglass className="absolute top-1/2 left-1/2 -z-10 w-[min(100vw,820px)] -translate-x-1/2 -translate-y-1/2 opacity-80" />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-40 pb-36 text-center sm:px-6">
          <p className="max-w-xl text-[17px] text-balance sm:text-xl">
            A 60-second explainer takes about{" "}
            <span className="font-serif text-2xl sm:text-3xl">3 hours</span> to
            research, write, film, cut and caption. The news moves faster than
            that.
          </p>
          <PillLink href="/feed" tone="lime" className="mt-8 h-8 text-[12px]">
            Skip to publish
          </PillLink>
        </div>
      </section>

      {/* ========================= GET THE GIST =========================== */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-20 sm:px-6">
        <Eyebrow icon={Sparkles}>Explain it</Eyebrow>
        <h2 className="mt-5 font-serif text-[34px] leading-tight tracking-tight sm:text-5xl">
          Explain{" "}
          <RotatingWord words={EXPLAIN_TOPICS} className="text-blue-600" /> in{" "}
          <span className="italic">∞</span> less time
        </h2>

        <div className="relative mt-12">
          <DotGrid className="-inset-x-10 -inset-y-10 opacity-60" />
          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <AskMock />
            <div className="max-w-sm lg:justify-self-end">
              <p className="text-[15px] leading-relaxed text-slate-500">
                Dense press releases, earnings calls and policy PDFs become{" "}
                <span className="text-slate-900">
                  scripts your audience will actually finish
                </span>
                , delivered by a face they&rsquo;ll actually watch.
              </p>
              <PillLink href="/feed" tone="light" className="mt-6">
                See how it works
              </PillLink>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-center gap-3 text-[15px]">
          <span>Cover beats across</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] shadow-sm">
            <span className="flex size-5 items-center justify-center rounded-md bg-blue-600 text-white">
              <Sparkles className="size-3" />
            </span>
            AI · Policy · Hardware · Space
          </span>
        </div>
      </section>

      {/* ========================== PRESENTERS =========================== */}
      <section
        id="presenters"
        className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-10 pb-28 sm:px-6 lg:grid-cols-2"
      >
        <div>
          <Eyebrow icon={Mic}>Presenters</Eyebrow>
          <h2 className="mt-5 font-serif text-[34px] leading-tight tracking-tight sm:text-5xl">
            Your face, or one of ours
          </h2>
          <p className="mt-3 max-w-sm text-[15px] text-slate-500">
            Use your own photo and voice, or one of our AI presenters. Swap the
            presenter mid-draft, swap the voice per video — no camera, no ring
            light, no reshoots.
          </p>
          <PillLink href="/feed" tone="dark" className="mt-7">
            Pick a presenter
          </PillLink>
          <p className="mt-10 flex items-center gap-2 text-[12px] text-slate-400">
            <Clapperboard className="size-3.5" />
            Rendering today&rsquo;s stories
          </p>
        </div>
        <PresenterOrbit />
      </section>

      {/* ============================== STATS ============================ */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-28 sm:px-6">
        <p className="max-w-lg font-serif text-[26px] leading-snug tracking-tight text-slate-500 sm:text-3xl">
          <span className="text-blue-600">Creators on Press Play</span>{" "}
          <span className="text-slate-900">post more</span> and film less.
        </p>
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <div className="flex items-end gap-6">
            <div>
              <p className="font-serif text-5xl tracking-tight">~5 min</p>
              <p className="mt-2 text-[13px] text-slate-500">
                Headline to publish-ready, captioned MP4
              </p>
            </div>
            <svg
              viewBox="0 0 120 40"
              className="mb-8 hidden h-10 w-28 text-blue-500 sm:block"
              aria-hidden
            >
              <path
                d="M2 30 C 30 30, 40 8, 70 10 S 110 28, 118 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="118" cy="6" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <p className="font-serif text-5xl tracking-tight">0</p>
              <p className="mt-2 text-[13px] text-slate-500">
                Cameras, reshoots or caption files
              </p>
            </div>
            <svg
              viewBox="0 0 60 40"
              className="mb-8 hidden h-10 w-14 text-blue-500 sm:block"
              aria-hidden
            >
              <path
                d="M4 36 L 14 4 L 26 34 L 36 10 L 46 30 L 56 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ============================ FINAL CTA ========================== */}
      <section className="relative isolate overflow-hidden text-white">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#ffffff_0%,#dbeafe_10%,#3b82f6_32%,#1e3a8a_65%,#020617_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-1/3 -z-10 h-72 bg-[radial-gradient(50%_100%_at_50%_0%,rgba(255,255,255,0.25),transparent_70%)]"
        />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-40 pb-24 text-center sm:px-6">
          <h2 className="max-w-md font-serif text-[36px] leading-[1.05] tracking-tight text-balance sm:text-5xl">
            Be first on whatever happens next
          </h2>
          <PillLink href="/feed" tone="lime" className="mt-8">
            Open your newsroom
          </PillLink>
        </div>

        {/* Footer (lives inside the dark band) */}
        <footer className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
          <div className="flex items-center gap-2 border-t border-white/10 pt-10 text-[11px] text-white/60">
            <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-2 py-0.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              All presenters on air
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/40">
            <span>
              © {new Date().getFullYear()} Press Play. Articles in, posts out.
            </span>
            <span>An AI newsroom for creators.</span>
          </div>

          <div className="mt-10 flex items-center gap-4 overflow-hidden text-white/[0.07] select-none">
            <DotMark className="size-14 shrink-0 sm:size-24" />
            <span className="font-serif text-[64px] leading-none tracking-tight whitespace-nowrap sm:text-[140px]">
              Press Play
            </span>
          </div>
        </footer>
      </section>
    </main>
  );
}
