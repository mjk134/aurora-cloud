"use server";

import { redirect } from "next/navigation";
import database from "../../lib/database";
import { hashPassword, passwordRegex } from "../../lib/password";
import { createSession } from "../../lib/session";
import { FormActionResponse } from "../../types";

export async function signUpAction(
  prevState: any,
  data: FormData,
): Promise<FormActionResponse | void> {
  if (!data.has("username") || !data.has("password")) {
    return { error: true, message: "Username or password not provided" };
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
  const doesUsernameExist = await database.users.findUnique({
    where: {
      username,
    },
  });

  // Validation checks

  if (doesUsernameExist) {
    return {
      error: true,
      message: "Username is already in use.",
      location: "username",
      values: { username, password },
    };
  }

  if (password.length < 8 || password.length > 20) {
    return {
      error: true,
      message: "Password must be between 8 and 20 characters.",
      location: "password",
      values: { username, password },
    };
  }
  // Password strength check
  if (!passwordRegex.test(password)) {
    return {
      error: true,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      location: "password",
      values: { username, password },
    };
  }

  // hash password
  const { salt, hash } = hashPassword(password);

  // Join salt and hash
  const saltedHash = `${salt}.${hash}`;

  // Encode salted hash
  const saltedHashEncoded = Buffer.from(saltedHash).toString("base64");

  // Store in database
  const user = await database.users.create({
    data: {
      username,
      password_hash: saltedHashEncoded,
    },
  });

  // Create folder 0
  await database.folder.create({
    data: {
      folder_id: "0",
      user_id: user.user_id,
      name: "Home",
    },
  });

  // Session created then redirect to home
  await createSession(user.user_id);

  redirect("/home");
}
