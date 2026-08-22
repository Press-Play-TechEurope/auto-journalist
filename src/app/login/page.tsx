import { Logo } from "~/components/logo";

import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden
        className="from-primary/25 pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,var(--tw-gradient-from),transparent_70%)] via-transparent to-transparent"
      />
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="from-primary flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br to-fuchsia-500 text-white shadow-lg">
            <Logo className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            auto-journalist
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter the newsroom password to continue.
          </p>
        </div>
        <LoginForm next={next ?? "/"} />
      </div>
    </main>
  );
}
