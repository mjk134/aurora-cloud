"use server";

import {
  deleteAllSessions,
  deleteSession,
  getUserFromSession,
} from "../../../lib/session";
import database from "../../../lib/database";
import { deleteFolder } from "../files/[[...dir]]/actions";
import { redirect } from "next/navigation";

export async function deleteAccount() {
  const user = await getUserFromSession();

  if (!user) {
    return {
      success: false,
      message: "An error occured while deleting the account.",
      error: "User not found.",
    };
  }

  const rootFolder = await database.folder.findFirst({
    where: {
      is_root: true,
      user_id: user.user_id,
    },
  });

  if (!rootFolder) {
    return {
      success: false,
      message: "An error occured while deleting the account.",
      error: "Root folder not found.",
    };
  }

  // Delete all files in the root folder
  await deleteFolder(rootFolder.folder_id, "/");

  // Delete user and session
  await database.users.delete({
    where: {
      user_id: user.user_id,
    },
  });

  await deleteAllSessions();
  redirect("/login");
}

export async function resetHome() {
  const user = await getUserFromSession();

  if (!user) {
    return {
      success: false,
      message: "An error occured while deleting the account.",
      error: "User not found.",
    };
  }

  const rootFolder = await database.folder.findFirst({
    where: {
      is_root: true,
      user_id: user.user_id,
    },
  });

  if (!rootFolder) {
    return {
      success: false,
      message: "An error occured while deleting the account.",
      error: "Root folder not found.",
    };
  }

  // Delete all files in the root folder
  await deleteFolder(rootFolder.folder_id, `/${rootFolder.folder_id}`, false);
}
