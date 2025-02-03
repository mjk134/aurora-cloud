import { cookies } from "next/headers";
import db from "./database";
import { Users } from "@prisma/client";

export async function createSession(id: string) {
  const currentSession = await getSession();
  if (currentSession) return;

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 1. Create a session in the database
  const sessionData = await db.session.create({
    data: {
      user_id: id,
      expires: expiresAt,
    },
  });

  const sessionId = sessionData.token;

  const session = {
    id: sessionId,
    expires: expiresAt.toISOString(),
    userId: id,
  };

  // TODO: Use the auth secret to encode the session token
  // 2. Sign the session token
  const token = Buffer.from(JSON.stringify(session)).toString("base64");

  // 3. Store the session in cookies for optimistic auth checks
  (await cookies()).set("snowflake", token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

type Session = {
  id: string;
  expires: string;
  userId: string;
};

export const getSession = async (): Promise<Session | null> => {
  const token = (await cookies()).get("snowflake");
  if (!token) return null;

  try {
    const session = JSON.parse(
      Buffer.from(token.value, "base64").toString("utf-8"),
    );

    return session;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getVerfiedSession = async () => {
  const session = await getSession();

  if (!session) return null;

  const data = await db.session.findUnique({
    where: {
      token: session.id,
    },
  });

  if (!data) {
    return null;
  }
  return session;
};

export async function getUserFromSession(): Promise<Users | null> {
  const session = await getVerfiedSession();

  if (!session) return null;

  // select only required fields
  const user = await db.users.findUnique({
    where: {
      user_id: (session as Record<string, any>).userId,
    },
  });

  return user;
}

export async function updateSession(): Promise<Session | null> {
  const token = (await cookies()).get("snowflake");

  if (!token) return null;

  try {
    const session = JSON.parse(
      Buffer.from(token.value, "base64").toString("utf-8"),
    );

    // Update the session in the database
    await db.session.update({
      where: {
        token: (session as Record<string, any>).id,
      },
      data: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const newSession = {
      id: (session as Record<string, any>).id,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      userId: (session as Record<string, any>).userId,
    };

    // Sign the session token

    const newToken = Buffer.from(JSON.stringify(newSession)).toString("base64");

    // Store the session in cookies for optimistic auth checks
    (await cookies()).set("snowflake", newToken, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
      path: "/",
    });

    return newSession;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const token = (await cookies()).get("snowflake");

  if (!token) return;

  try {
    const session = JSON.parse(
      Buffer.from(token.value, "base64").toString("utf-8"),
    );

    await db.session.delete({
      where: {
        token: (session as Record<string, any>).id,
      },
    });

    (await cookies()).set("snowflake", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
      sameSite: "lax",
      path: "/",
    });
  } catch (error) {
    console.log(error);
  }
}
