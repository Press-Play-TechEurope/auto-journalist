import {
  ArrowRight,
  Clapperboard,
  Newspaper,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";

const STEPS = [
  {
    icon: Newspaper,
    title: "We read the news",
    body: "So you don't have to. We hoover up articles and tech announcements from the sources that matter.",
  },
  {
    icon: Wand2,
    title: "AI writes the script",
    body: "Dense press release in, snappy script out. Jargon gets benched, the point gets made.",
  },
  {
    icon: Clapperboard,
    title: "A presenter spills it",
    body: "Our talking heads deliver the story in a short video built for your feed, not a lecture hall.",
  },
];

const TICKER = [
  "no 10-minute reads",
  "no paywall energy",
  "no jargon",
  "just the tea",
  "actually understand tech",
  "news that slaps",
  "zero doomscroll required",
  "explainers that explain",
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Backdrop */}
      <div
        aria-hidden
        className="from-primary/30 pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50rem_32rem_at_20%_-10%,var(--tw-gradient-from),transparent_70%),radial-gradient(40rem_28rem_at_90%_10%,var(--tw-gradient-from),transparent_70%)] via-transparent to-transparent [--tw-gradient-from:var(--color-primary)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(36rem_24rem_at_85%_90%,oklch(0.8_0.18_330/0.25),transparent_70%)]"
      />

      {/* Header */}
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <span className="from-primary flex size-8 items-center justify-center rounded-lg bg-gradient-to-br to-fuchsia-500 text-white shadow-sm">
          <Logo className="size-4.5" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">
          Press Play
        </span>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/login" />}
            nativeButton={false}
          >
            Sign in
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
        <p className="bg-primary/10 text-primary animate-in fade-in slide-in-from-bottom-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase duration-500">
          News, but make it watchable
        </p>
        <h1 className="font-display animate-in fade-in slide-in-from-bottom-3 mt-6 max-w-3xl text-5xl font-bold tracking-tight text-balance delay-100 duration-500 sm:text-7xl">
          TL;DR the entire news cycle.{" "}
          <span className="from-primary bg-gradient-to-r to-fuchsia-500 bg-clip-text text-transparent">
            Just press play.
          </span>
        </h1>
        <p className="text-muted-foreground animate-in fade-in slide-in-from-bottom-4 mt-6 max-w-xl text-lg text-balance delay-200 duration-500">
          Press Play turns news articles and tech announcements into short
          talking-head videos that actually explain what&rsquo;s going on —
          made for the masses, the young, and the chronically online.
        </p>
        <div className="animate-in fade-in slide-in-from-bottom-5 mt-8 flex flex-wrap items-center justify-center gap-3 delay-300 duration-500">
          <Button
            size="lg"
            render={<Link href="/feed" />}
            nativeButton={false}
          >
            <Zap data-icon="inline-start" />
            Enter the newsroom
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="#how-it-works" />}
            nativeButton={false}
          >
            How it works
          </Button>
        </div>
      </section>

      {/* Ticker */}
      <section
        aria-hidden
        className="border-y bg-black py-3 text-white dark:bg-white dark:text-black"
      >
        <div className="animate-in fade-in flex w-full justify-center gap-8 overflow-hidden text-sm font-semibold tracking-wide whitespace-nowrap uppercase duration-700">
          {TICKER.map((t) => (
            <span key={t} className="flex items-center gap-2">
              <Sparkles className="size-3.5" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6"
      >
        <h2 className="font-display text-center text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          From headline to talking head in minutes
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-center text-balance">
          The whole newsroom, minus the coffee budget and the existential
          dread.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="bg-card rounded-2xl border p-6 shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="from-primary flex size-11 items-center justify-center rounded-xl bg-gradient-to-br to-fuchsia-500 text-white shadow-sm">
                  <step.icon className="size-5" />
                </div>
                <span className="font-display text-muted-foreground/40 text-4xl font-bold">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold">
                {step.title}
              </h3>
              <p className="text-muted-foreground mt-1.5 text-sm">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        <div className="from-primary relative overflow-hidden rounded-3xl bg-gradient-to-br to-fuchsia-600 px-6 py-14 text-center text-white sm:px-12">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            The news wasn&rsquo;t built for your brain. We fixed that.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80 text-balance">
            Knowing what&rsquo;s happening in the world shouldn&rsquo;t require
            a journalism degree or a 40-tab browser session. Press Play makes
            news and tech accessible for everyone — one video at a time.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              variant="secondary"
              render={<Link href="/feed" />}
              nativeButton={false}
            >
              <Clapperboard data-icon="inline-start" />
              Watch the news instead
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground mt-8 text-center text-xs">
          Press Play — an AI newsroom experiment. Articles in, vibes out.
        </p>
      </section>
    </main>
  );
}
