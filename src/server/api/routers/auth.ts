import { createTRPCRouter, publicProcedure } from "../trpc";
import { LoginSchema, SignUpSchema } from "../../../common/validations/auth";
import { eq } from "drizzle-orm";
import { keys, users } from "../../db/schema";
import { TRPCError } from "@trpc/server";
import { Argon2id } from "oslo/password";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(SignUpSchema)
    .mutation(async ({ ctx, input }) => {
      const { username, email, password } = input;

      await ctx.db.transaction(async (tx) => {
        if (
          await tx.query.users.findFirst({
            where: eq(users.username, username),
          })
        )
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already taken.",
          });

        if (
          await tx.query.users.findFirst({
            where: eq(users.email, email),
          })
        )
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use.",
          });
      });

      const exists = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (exists)
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });

      const result = await ctx.db.transaction(async (tx) => {
        const created = await tx
          .insert(users)
          .values({ username, email })
          .returning();

        if (created[0])
          // checks if user was created...
          await tx
            .insert(keys)
            .values({ userId: created[0].id, hashedPassword: password });
        else
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unable to create user",
          });
        return created[0];
      });

      return {
        status: 201,
        messages: "Account created successfully",
        result: result,
      };
    }),
  login: publicProcedure.input(LoginSchema).mutation(async ({ ctx, input }) => {
    const { username, password } = input;

    const exists = await ctx.db.query.users.findFirst({
      where: eq(users.username, username),
      with: { key: true },
    });

    if (!exists)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Incorrect username or password",
      });

    const validPassword = await new Argon2id().verify(
      exists.key?.hashedPassword ?? "",
      password,
    );

    if (!validPassword)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Incorrect username or password",
      });

    return {
      status: 200,
      message: "Logged In Successfully.",
      result: { id: exists.id, username: exists.username },
    };
  }),
});
