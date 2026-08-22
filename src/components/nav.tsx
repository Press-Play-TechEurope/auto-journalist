"use client";

import { Clapperboard, LogOut, Newspaper, Rss, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "~/app/login/actions";
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
    <header className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
            <Newspaper className="size-4" />
          </span>
          auto-journalist
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon, match }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                match(pathname) && "bg-muted text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="ml-auto">
          <Button type="submit" variant="ghost" size="sm">
            <LogOut data-icon="inline-start" />
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
