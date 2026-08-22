import {
  ArrowUp,
  Check,
  Clapperboard,
  Globe,
  Inbox,
  Mic,
  Newspaper,
  Play,
  Rss,
  Search,
  Settings,
  Sparkles,
  Volume2,
} from "lucide-react";
import Image from "next/image";

import { cn } from "~/lib/utils";

const STORIES = [
  { title: "OpenAI ships GPT-5.5 to free users", tag: "AI", status: "ready" },
  {
    title: "EU fines Meta €1.2B over ad tracking",
    tag: "Policy",
    status: "ready",
  },
  {
    title: "Apple quietly kills the Lightning port",
    tag: "Hardware",
    status: "live",
  },
  { title: "Figma adds AI layout for mobile", tag: "Design", status: "draft" },
  { title: "Starlink hits 10M subscribers", tag: "Space", status: "draft" },
];

/** The big "app window" mockup under the first headline. */
export function ProductMock() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-[0_40px_120px_-40px_rgba(37,99,235,0.35),0_2px_6px_rgba(15,23,42,0.04)]">
      {/* Window bar */}
      <div className="flex h-10 items-center gap-2 border-b border-slate-100 px-4">
        <span className="size-2.5 rounded-full bg-slate-200" />
        <span className="size-2.5 rounded-full bg-slate-200" />
        <span className="size-2.5 rounded-full bg-slate-200" />
        <span className="ml-4 rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] text-slate-500">
          All stories
        </span>
        <span className="ml-auto hidden items-center gap-1 rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] text-slate-500 sm:flex">
          Apple quietly kills the Lightning port
          <span className="ml-1 rounded bg-slate-100 px-1 text-[10px]">⌘K</span>
        </span>
      </div>

      <div className="flex">
        {/* Icon rail */}
        <aside className="hidden w-12 shrink-0 flex-col items-center gap-5 border-r border-slate-100 py-5 text-slate-400 sm:flex">
          <span className="flex size-7 items-center justify-center rounded-md bg-slate-900 text-white">
            <Play className="size-3.5 fill-current" />
          </span>
          <Inbox className="size-4" />
          <Rss className="size-4 text-blue-600" />
          <Clapperboard className="size-4" />
          <Mic className="size-4" />
          <Settings className="mt-auto size-4" />
        </aside>

        {/* Story list */}
        <div className="hidden w-60 shrink-0 border-r border-slate-100 p-3 md:block">
          <div className="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-medium text-slate-500">
            <Search className="size-3" /> Search stories
          </div>
          <ul className="space-y-0.5">
            {STORIES.map((s, i) => (
              <li
                key={s.title}
                className={cn(
                  "flex items-start gap-2 rounded-lg px-2 py-1.5 text-[12px] leading-snug",
                  i === 2 ? "bg-blue-50 text-slate-900" : "text-slate-600",
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 size-1.5 shrink-0 rounded-full",
                    s.status === "live"
                      ? "bg-blue-600"
                      : s.status === "ready"
                        ? "bg-emerald-500"
                        : "bg-slate-300",
                  )}
                />
                <span className="line-clamp-2">{s.title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Story detail */}
        <div className="min-w-0 flex-1 p-5 sm:p-7">
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 border-b border-slate-900 pb-1 text-slate-900">
              <Sparkles className="size-3" /> Script
            </span>
            <span className="flex items-center gap-1 pb-1">
              <Newspaper className="size-3" /> Sources
            </span>
            <span className="flex items-center gap-1 pb-1">
              <Clapperboard className="size-3" /> Video
            </span>
          </div>

          <h3 className="mt-5 font-serif text-2xl tracking-tight text-slate-900 sm:text-[28px]">
            Apple quietly kills the Lightning port
          </h3>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-full bg-blue-600 px-2 py-0.5 font-medium text-white">
              Live
            </span>
            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-600">
              Hardware
            </span>
            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-600">
              0:58
            </span>
            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-600">
              Presented by Eliska
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_200px]">
            <div className="space-y-5 text-[13px] leading-relaxed text-slate-600">
              <div>
                <p className="mb-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  What&rsquo;s going on
                </p>
                <p>
                  Okay so Apple just did the thing. Every iPhone, iPad and
                  accessory shipping this fall is USB-C only.{" "}
                  <span className="rounded bg-blue-50 px-1 text-blue-700">
                    The cable drawer is finally free.
                  </span>
                </p>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  Why it matters
                </p>
                <p>
                  It&rsquo;s less about the plug and more about the EU forcing
                  Apple&rsquo;s hand. Expect the same playbook for app stores
                  next.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {["Regenerate", "Swap presenter", "Shorten to 30s"].map((a) => (
                  <span
                    key={a}
                    className="rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative aspect-[9/12] overflow-hidden rounded-xl bg-slate-900 lg:aspect-auto lg:h-full lg:min-h-[220px]">
              <Image
                src="/presenters/eliska.jpg"
                alt=""
                fill
                sizes="200px"
                priority
                className="object-cover opacity-90"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                <span className="flex size-7 items-center justify-center rounded-full bg-white text-slate-900">
                  <Play className="size-3 fill-current" />
                </span>
                <div className="h-0.5 flex-1 rounded bg-white/30">
                  <div className="h-full w-2/5 rounded bg-white" />
                </div>
                <Volume2 className="size-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** "Read" card: a stack of incoming articles being triaged. */
export function ReadMock() {
  const items = [
    { src: "The Verge", title: "Apple kills Lightning", picked: true },
    { src: "Reuters", title: "EU fines Meta €1.2B", picked: true },
    {
      src: "TechCrunch",
      title: "Yet another AI wrapper raises",
      picked: false,
    },
  ];
  return (
    <div className="relative h-56 overflow-hidden">
      <div className="absolute inset-x-6 top-4 space-y-2">
        {items.map((it, i) => (
          <div
            key={it.title}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
            style={{
              opacity: 1 - i * 0.18,
              transform: `scale(${1 - i * 0.02})`,
            }}
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <Globe className="size-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-slate-800">
                {it.title}
              </p>
              <p className="text-[10px] text-slate-400">{it.src}</p>
            </div>
            {it.picked ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="size-3" />
              </span>
            ) : (
              <span className="size-5 rounded-full border border-dashed border-slate-300" />
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-white via-white/90 to-transparent pt-10 pb-4">
        <span className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] text-white">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          Reading 14 sources…
        </span>
      </div>
    </div>
  );
}

/** "Write" card: a chatty script being assembled from a dense source. */
export function WriteMock() {
  return (
    <div className="relative h-56 overflow-hidden">
      <div className="absolute top-4 right-6 left-6 space-y-2">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
          &ldquo;…the Commission&rsquo;s decision, pursuant to Article 102 TFEU,
          imposes a fine of €1.2 billion for abusive conduct…&rdquo;
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-blue-600 px-3 py-2 text-[12px] leading-relaxed text-white shadow-sm">
          The EU just fined Meta 1.2 billion euros. Why? Tracking you across the
          internet without really asking. Here&rsquo;s what changes…
        </div>
        <div className="flex gap-1.5 pl-1">
          {["Gen Z", "58s", "Eliska"].map((t) => (
            <span
              key={t}
              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute right-8 bottom-6">
        <span className="relative flex size-12 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.6)] ring-1 ring-slate-200">
          <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
          <span className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-white">
            <Sparkles className="size-4" />
          </span>
        </span>
      </div>
    </div>
  );
}

/** "Ask anything" search box with suggestions. */
export function AskMock() {
  return (
    <div className="mx-auto w-full max-w-md text-left">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pr-2 pl-4 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.35)]">
        <Search className="size-4 text-slate-400" />
        <span className="flex-1 text-[13px] text-slate-500">
          Explain this story like I&rsquo;m busy…
        </span>
        <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-white">
          <ArrowUp className="size-4" />
        </span>
      </div>
      <div className="mt-3 space-y-2 pl-4">
        {[
          ["Why does the EU keep fining Meta?", 1],
          ["What actually changed in GPT-5.5?", 0.6],
          ["Is Starlink profitable yet?", 0.3],
        ].map(([q, o]) => (
          <div
            key={q as string}
            className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] text-slate-600"
            style={{ opacity: o as number }}
          >
            <Sparkles className="size-3 text-blue-600" />
            {q}
          </div>
        ))}
      </div>
    </div>
  );
}

const PRESENTERS = [
  { src: "/presenters/zach.jpg", size: 92, x: "6%", y: "8%" },
  { src: "/presenters/gpt1.png", size: 64, x: "44%", y: "0%" },
  { src: "/presenters/ty.jpg", size: 112, x: "66%", y: "18%" },
  { src: "/presenters/gpt2.png", size: 72, x: "18%", y: "52%" },
  { src: "/presenters/eliska.jpg", size: 120, x: "42%", y: "44%" },
  { src: "/presenters/gpt3.png", size: 68, x: "76%", y: "70%" },
];

/** Floating presenter avatars, à la the "connect your stack" logo cloud. */
export function PresenterOrbit() {
  return (
    <div className="relative mx-auto h-[360px] w-full max-w-md">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full border border-dashed border-slate-200"
      />
      <div
        aria-hidden
        className="absolute inset-[18%] rounded-full border border-dashed border-slate-200"
      />
      {PRESENTERS.map((p) => (
        <span
          key={p.src}
          className="absolute overflow-hidden rounded-full bg-white shadow-[0_12px_30px_-12px_rgba(15,23,42,0.35)] ring-4 ring-white"
          style={{ width: p.size, height: p.size, left: p.x, top: p.y }}
        >
          <Image
            src={p.src}
            alt=""
            width={p.size}
            height={p.size}
            className="size-full object-cover"
          />
        </span>
      ))}
      <span className="absolute top-[30%] left-[38%] flex size-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-white">
        <Play className="size-5 fill-current" />
      </span>
    </div>
  );
}
