"use server";

import { revalidatePath } from "next/cache";
import { getUserFromSession } from "../../../../lib/session";
import database from "../../../../lib/database";
import { redirect } from "next/navigation";

export async function createFolder(
  name: string,
  parentFolderId: string,
  pathname: string,
) {
  // Create db entry for folder
  const user = await getUserFromSession();
  console.log("Creating new folder in path:", pathname, parentFolderId, name);

  if (!user) return;

  const folder = await database.folder.create({
    data: {
      name: name,
      user_id: user?.user_id,
    },
  });

  const parent = await database.parent.create({
    data: {
      file_id: folder.folder_id, // Treat the folder like a file
      folder_id: parentFolderId,
      user_id: user.user_id,
    },
  });

  redirect(pathname + "/" + folder.folder_id);
}

export async function revalidateFiles(pathname: string) {
  revalidatePath("/home/files", "page");
  revalidatePath(pathname);
  // redirect(pathname)
}

/**
 * Delete a file from the database and storage.
 * @param file The file to delete
 * @param pathname The pathname of the file location in terms of folders
 */
export async function deleteFile(fileId: string, pathname: string) {
  const user = await getUserFromSession();

  if (!user) return;

  const dbFile = await database.file.findFirst({
    where: {
      file_id: fileId,
      user_id: user?.user_id,
    },
    include: {
      discord_storage: true,
      telegram_storage: true,
    },
  });

  if (!dbFile) return;

  if (dbFile.discord_storage) {
    // purge discord storage entries
    await database.discordStorage.deleteMany({
      where: {
        file_id: fileId,
        user_id: user.user_id,
      },
    });
  } else if (dbFile.telegram_storage) {
    // purge telegram storage entries
    await database.telegramStorage.deleteMany({
      where: {
        file_id: fileId,
        user_id: user.user_id,
      },
    });
  }

  // Delete parent entry
  await database.parent.deleteMany({
    where: {
      file_id: fileId,
      user_id: user.user_id,
    },
  });

  // Delete file entry
  await database.file.delete({
    where: {
      file_id: fileId,
      user_id: user.user_id,
    },
  });

  revalidatePath(pathname); // revalidate folder path
}
