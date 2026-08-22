"use client";

import { Clapperboard, LogOut, Rss, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "~/app/login/actions";
import { Logo } from "~/components/logo";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const LINKS = [
  { href: "/", label: "Feed", icon: Rss, match: (p: string) => p === "/" },
  {
    href: "/library",
    label: "Library",
    icon: Clapperboard,
    match: (p: string) => p.startsWith("/library"),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    match: (p: string) => p.startsWith("/settings"),
  },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="bg-background/70 sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="font-display flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="from-primary flex size-7 items-center justify-center rounded-lg bg-gradient-to-br to-fuchsia-500 text-white shadow-sm">
            <Logo className="size-4" />
          </span>
          auto-journalist
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon, match }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                match(pathname) &&
                  "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-medium",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut data-icon="inline-start" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
