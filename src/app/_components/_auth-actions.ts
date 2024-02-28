"use server";

import type { ILogin, ISignUp } from "@/common/validations/auth";
import { lucia, validateRequest } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Argon2id } from "oslo/password";

export async function signup(data: ISignUp): Promise<ActionResult> {
  const password = await new Argon2id().hash(data.password);

  const { status, result } = await api.auth.signUp.mutate({
    ...data,
    password,
  });

  if (status === 201) {
    const session = await lucia.createSession(result.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return redirect("/");
  } else {
    throw new Error("Unable to complete sign up.");
  }
}

export async function login(data: ILogin): Promise<ActionResult> {
  const password = await new Argon2id().hash(data.password);

  const { status, result } = await api.auth.login.mutate({
    ...data,
  });

  if (status === 200) {
    const session = await lucia.createSession(result.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return redirect("/dashboard");
  } else {
    return { error: "Unauthorized" };
  }
}

export async function logout(): Promise<ActionResult> {
  const { session } = await validateRequest();

  if (!session) return { error: "Unauthorized" };

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/auth/login");
}

export interface ActionResult {
  error: string;
}
