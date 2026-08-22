"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "~/env";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "~/server/auth";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const pw = formData.get("password");
  const password = typeof pw === "string" ? pw : "";
  const nx = formData.get("next");
  const next = typeof nx === "string" ? nx : "/feed";

  if (password !== env.APP_PASSWORD) {
    return { error: "Incorrect password." };
  }

  const token = await createSessionToken(env.AUTH_SECRET);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect(next.startsWith("/") ? next : "/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
