import { object, string } from "zod";

export const signUpSchema = object({
  email: string({ required_error: "Email is required." })
    .min(1, "Email is required.")
    .email("Invalid email."),
  username: string({ required_error: "Username is required." })
    .min(1, " Username is required.")
    .max(32, " Username must be less than 32 characters."),
  password: string({ required_error: "Password is required." })
    .min(1, "Password is required.")
    .min(8, "Password must be more than 8 characters.")
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
});

export const loginSchema = object({
  email: string({ required_error: "Email is required." })
    .min(1, "Email is required.")
    .email("Invalid email."),
  password: string({ required_error: "Password is required." })
    .min(1, "Password is required.")
    .min(8, "Password must be more than 8 characters.")
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
});
