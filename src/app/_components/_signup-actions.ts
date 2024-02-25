"use server";

import type { ISignUp } from "@/common/validations/auth";
import { lucia } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Argon2id } from "oslo/password";

export async function signup(data: ISignUp) {
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
