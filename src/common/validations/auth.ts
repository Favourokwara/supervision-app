import { z } from "zod";

export const LoginSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be more than 3 characters." })
    .max(31, { message: "Username can't be more than 31 characters." }),
  password: z
    .string()
    .min(6, { message: "Password must be more than 6 characters." })
    .max(255, { message: "Password can't be more than 255 characters." }),
});

export type ILogin = z.infer<typeof LoginSchema>;

export const SignUpSchema = LoginSchema.extend({
  email: z.string().email(),
});

export type ISignUp = z.infer<typeof SignUpSchema>;
