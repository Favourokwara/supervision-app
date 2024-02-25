import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "./db";
import { sessions, users } from "./db/schema";
import { Lucia } from "lucia";
import { env } from "@/env";
import type { ISignUp } from "@/common/validations/auth";

export const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: { secure: env.NODE_ENV === "production" },
  },
  getUserAttributes: (attributes) => ({
    username: attributes.username,
    email: attributes.email,
  }),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<ISignUp, "password">;
  }
}
