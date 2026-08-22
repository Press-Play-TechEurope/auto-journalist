import {
  ArrowRight,
  Clapperboard,
  Mic,
  Newspaper,
  Sparkles,
  Wand2,
} from "lucide-react";
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

const NAV = [
  { href: "/feed", label: "Feed" },
  { href: "/library", label: "Library" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#presenters", label: "Presenters" },
];

const FOOTER = [
  {
    title: "Product",
    links: [
      ["Feed", "/feed"],
      ["Library", "/library"],
      ["Presenters", "#presenters"],
      ["How it works", "#how-it-works"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "#"],
      ["Careers", "#"],
      ["Press", "#"],
      ["Changelog", "#"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms", "#"],
      ["Privacy", "#"],
      ["Cookies", "#"],
    ],
  },
  {
    title: "Connect",
    links: [
      ["X (Twitter)", "#"],
      ["LinkedIn", "#"],
      ["GitHub", "#"],
    ],
  },
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
    lime: "bg-[#dff24a] text-slate-900 hover:bg-[#e8f86a] shadow-[0_10px_30px_-10px_rgba(223,242,74,0.8)]",
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
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-8 items-center px-3 text-[13px] text-white/80 transition-colors hover:text-white sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/feed"
              className="inline-flex h-8 items-center rounded-full bg-white px-3.5 text-[13px] font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Watch the feed
            </Link>
          </div>
        </header>

        {/* Hero copy */}
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-14 pb-48 text-center sm:px-6 sm:pt-20 sm:pb-64">
          <Link
            href="/feed"
            className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1 pr-3 pl-1 text-[12px] text-white/80 backdrop-blur duration-500 hover:bg-white/10"
          >
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-900">
              New
            </span>
            ElevenLabs voices for every presenter
            <ArrowRight className="size-3" />
          </Link>
          <h1 className="animate-in fade-in slide-in-from-bottom-3 mt-7 max-w-3xl font-serif text-[44px] leading-[1.02] tracking-[-0.02em] text-balance delay-100 duration-500 sm:text-7xl">
            Everything that happened today, in about a minute
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 mt-6 max-w-lg text-[15px] leading-relaxed text-balance text-white/75 delay-200 duration-500 sm:text-base">
            Press Play reads the articles, writes the script and puts a
            presenter on camera. News and tech for the masses — articles in,
            vibes out.
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-5 mt-8 delay-300 duration-500">
            <PillLink href="/feed" tone="lime">
              Enter the newsroom
            </PillLink>
          </div>
        </div>
      </section>

      {/* ======================= WATCH MORE, READ LESS ==================== */}
      <section
        id="how-it-works"
        className="relative mx-auto w-full max-w-6xl px-4 pt-8 pb-24 sm:px-6 sm:pt-12"
      >
        <h2 className="font-serif text-[34px] leading-tight tracking-tight sm:text-5xl">
          Watch more, read less
        </h2>
        <p className="mt-3 max-w-md text-[15px] text-slate-500">
          Press Play keeps you <span className="text-slate-900">informed</span>{" "}
          without the 40-tab browser session, the paywalls or the jargon.
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
            <span className="text-slate-900">
              Find the story behind the headline
            </span>{" "}
            with the sources, the context and the &ldquo;why it matters&rdquo;
            in one place.
          </p>
          <PillLink href="/feed" tone="light" className="sm:ml-auto">
            Explore
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
              We read the news so you don&rsquo;t have to
            </h3>
            <p className="mt-2 max-w-sm text-[14px] text-slate-500">
              We hoover up articles and announcements from the sources that
              matter, then pick the ones worth your minute.
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
              AI writes the script
            </h3>
            <p className="mt-2 max-w-sm text-[14px] text-slate-500">
              Dense press release in, snappy script out. Jargon gets benched,
              the point gets made.
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
            The average person spends{" "}
            <span className="font-serif text-2xl sm:text-3xl">2h 24m</span> a
            day scrolling the news and still can&rsquo;t explain it at dinner
          </p>
          <PillLink href="/feed" tone="lime" className="mt-8 h-8 text-[12px]">
            Start watching instead
          </PillLink>
        </div>
      </section>

      {/* ========================= GET THE GIST =========================== */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-20 sm:px-6">
        <Eyebrow icon={Sparkles}>Get the gist</Eyebrow>
        <h2 className="mt-5 font-serif text-[34px] leading-tight tracking-tight sm:text-5xl">
          Understand tech in <span className="italic">∞</span> less time
        </h2>

        <div className="relative mt-12">
          <DotGrid className="-inset-x-10 -inset-y-10 opacity-60" />
          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <AskMock />
            <div className="max-w-sm lg:justify-self-end">
              <p className="text-[15px] leading-relaxed text-slate-500">
                Dense press releases, earnings calls and policy PDFs become{" "}
                <span className="text-slate-900">
                  scripts your group chat would actually read
                </span>
                , delivered by a face you&rsquo;ll actually watch.
              </p>
              <PillLink href="/feed" tone="light" className="mt-6">
                Learn more
              </PillLink>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-center gap-3 text-[15px]">
          <span>Stories across</span>
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
            Meet the talking heads
          </h2>
          <p className="mt-3 max-w-sm text-[15px] text-slate-500">
            Real faces and AI-rendered ones, each with their own ElevenLabs
            voice. Pick who delivers the story, swap mid-draft, no lecture hall
            required.
          </p>
          <PillLink href="/feed" tone="dark" className="mt-7">
            Get started
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
          <span className="text-blue-600">People who use Press Play</span>{" "}
          <span className="text-slate-900">understand more</span> and doomscroll
          less.
        </p>
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <div className="flex items-end gap-6">
            <div>
              <p className="font-serif text-5xl tracking-tight">60s</p>
              <p className="mt-2 text-[13px] text-slate-500">
                Average story, headline to &ldquo;got it&rdquo;
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
                Paywalls, jargon or 10-minute reads
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
            Be ready for whatever happens next
          </h2>
          <PillLink href="/feed" tone="lime" className="mt-8">
            Enter the newsroom
          </PillLink>
        </div>

        {/* Footer (lives inside the dark band) */}
        <footer className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-12 text-[12px] sm:grid-cols-4">
            {FOOTER.map((col) => (
              <div key={col.title}>
                <p className="text-white/50">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href!}
                        className="text-white/85 transition-colors hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex items-center gap-2 text-[11px] text-white/60">
            <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-2 py-0.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              All presenters on air
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/40">
            <span>
              © {new Date().getFullYear()} Press Play. Articles in, vibes out.
            </span>
            <span>An AI newsroom experiment.</span>
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
