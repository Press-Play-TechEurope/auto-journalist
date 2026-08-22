import { Newspaper } from "lucide-react";

import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="bg-muted/30 flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl">
            <Newspaper className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
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
