"use server";

import { redirect } from "next/navigation";
import database from "../../lib/database";
import { passwordRegex, verifyPassword } from "../../lib/password";
import type { FormActionResponse } from "../../types";
import { createSession } from "../../lib/session";

export async function loginAction(
  prevState: any,
  data: FormData,
): Promise<FormActionResponse | void> {
  if (!data.has("username") || !data.has("password")) {
    // Shouldn't be possible to reach this point, but just in case.
    return { error: true, message: "Username or password not provided." };
  }

  const username = data.get("username") as string;
  const password = data.get("password") as string;

  // Data validation
  if (username.length < 3 || username.length > 20) {
    return {
      error: true,
      message: "Username must be between 3 and 20 characters.",
      location: "username",
      values: { username, password },
    };
  }

  // No spaces in username
  if (username.includes(" ")) {
    return {
      error: true,
      message: "Username cannot contain spaces.",
      location: "username",
      values: { username, password },
    };
  }

  // Only alphanumeric characters in username and . and _
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return {
      error: true,
      message:
        "Username can only contain letters, numbers, periods, and underscores.",
      location: "username",
      values: { username, password },
    };
  }
  // Check if username in use.
  const user = await database.users.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    return {
      error: true,
      message: "No user with this username, please sign up.",
      location: "username",
      values: { username, password },
    };
  }

  if (password.length < 8 || password.length > 20) {
    return {
      error: true,
      message: "Invalid password.",
      location: "password",
      values: { username, password },
    };
  }
  // Password strength check
  if (!passwordRegex.test(password)) {
    return {
      error: true,
      message: "Invalid password.",
      location: "password",
      values: { username, password },
    };
  }

  const decodedPassword = Buffer.from(user.password_hash, "base64").toString(
    "utf-8",
  );
  const [salt, hash] = decodedPassword.split(".");

  if (!salt || !hash) {
    return {
      error: true,
      message: "Invalid password.",
      location: "password",
      values: { username, password },
    };
  }

  const isPasswordCorrect = verifyPassword(password, hash, salt);

  if (!isPasswordCorrect) {
    return {
      error: true,
      message: "Invalid password.",
      location: "password",
      values: { username, password },
    };
  }

  await createSession(user.user_id);
  console.log("Session created");

  redirect("/home");
}
