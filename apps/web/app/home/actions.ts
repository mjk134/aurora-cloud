"use server";

import { redirect } from "next/navigation";
import { deleteSession, getUserFromSession } from "../../lib/session";
import database from "../../lib/database";

export async function logout() {
  await deleteSession();
  redirect("/login");
}

/**
 * Used for getting files to render in client components.
 */
export async function getFiles(filesIds: string[]) {
  const user = await getUserFromSession();

  if (!user) {
    return [];
  }

  return database.file.findMany({
    where: {
      file_id: {
        in: filesIds,
      },
      user_id: user.user_id,
    },
  });
}
