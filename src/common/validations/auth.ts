import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: "" }).max(255, { message: "" }),
});

export type ILogin = z.infer<typeof LoginSchema>;

export const SignUpSchema = LoginSchema.extend({
  username: z.string().min(3, { message: "" }).max(31, { message: "" }),
});

export type ISignUp = z.infer<typeof SignUpSchema>;
