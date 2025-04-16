"use server";

import {
  deleteAllSessions,
  deleteSession,
  getUserFromSession,
} from "../../../lib/session";
import database from "../../../lib/database";
import { deleteFolder } from "../files/[[...dir]]/actions";
import { redirect } from "next/navigation";
import { tryCatch } from "@repo/util";

export async function deleteAccount() {
  const user = await getUserFromSession();

  if (!user) {
    return {
      success: false,
      message: "An error occured while deleting the account.",
      error: "User not found.",
    };
  }

  const result = await tryCatch<Response>(
    fetch("http://localhost:3000/upload/clear-queue", {
      method: "DELETE",
      body: user.user_id,
    }),
  );

  if (!result.success) {
    return {
      success: false,
      message: "An error occured while deleting the account.",
      error: result.value,
    };
  }

  const rootFolder = await database.folder.findFirst({
    where: {
      is_root: true,
      user_id: user.user_id,
    },
  });

  if (!rootFolder) {
    console.log(
      "[Account deletion] Root folder not found for user",
      rootFolder,
    );
    return {
      success: false,
      message: "An error occured while deleting the account.",
      error: "Root folder not found.",
    };
  }

  // Delete all files in the root folder
  const deleteResult = await tryCatch(deleteFolder(rootFolder.folder_id, "/"));

  if (!deleteResult.success) {
    console.log(
      "[Account deletion] Error deleting root folder",
      deleteResult.value,
    );
    return {
      success: false,
      message: "An error occured while deleting the account.",
      error: deleteResult.value,
    };
  }

  await deleteAllSessions();

  // Delete user and session
  await database.users.delete({
    where: {
      user_id: user.user_id,
    },
  });

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

  const result = await tryCatch<Response>(
    fetch("http://localhost:3000/upload/clear-queue", {
      method: "DELETE",
      body: user.user_id,
    }),
  );

  if (!result.success) {
    return {
      success: false,
      message: "An error occured while deleting the account.",
      error: result.value,
    };
  }

  // Delete all files in the root folder
  await deleteFolder(rootFolder.folder_id, `/${rootFolder.folder_id}`, false);
}
