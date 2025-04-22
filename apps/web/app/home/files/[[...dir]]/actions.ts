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

  await database.parent.create({
    data: {
      file_id: folder.folder_id, // Treat the folder like a file
      folder_id: parentFolderId,
      user_id: user.user_id,
    },
  });

  redirect(pathname + "/" + folder.folder_id);
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
  });

  if (!dbFile) return;

  await database.discordStorage.deleteMany({
    where: {
      file_id: fileId,
      user_id: user.user_id,
    },
  });

  await database.telegramStorage.deleteMany({
    where: {
      file_id: fileId,
      user_id: user.user_id,
    },
  });

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

export async function deleteFolder(folderId: string, pathname?: string, removeRoot = true): Promise<[string[], string[]]> {
  const user = await getUserFromSession();

  if (!user) return [[], []];

  // Get all files and folders in the folder
  const [fileIds, folderIds] = await getAllSubFileIds(folderId, user.user_id);

  console.log("Deleting folder:", folderId, fileIds, folderIds);

  // Delete parent entries
  await database.parent.deleteMany({
    where: {
      file_id: {
        in: [...fileIds, ...folderIds, folderId],
      },
      user_id: user.user_id,
    },
  });

  await database.discordStorage.deleteMany({
    where: {
      file_id: {
        in: fileIds,
      },
      user_id: user.user_id,
    },
  });

  await database.telegramStorage.deleteMany({
    where: {
      file_id: {
        in: fileIds,
      },
      user_id: user.user_id,
    },
  });

  // Delete file entries
  await database.file.deleteMany({
    where: {
      file_id: {
        in: fileIds,
      },
      user_id: user.user_id,
    },
  });

  // Delete folder entries
  await database.folder.deleteMany({
    where: {
      folder_id: {
        in: [...folderIds, ...[removeRoot ? folderId : []].flat()],
      },
      user_id: user.user_id,
    },
  });

  if (!pathname) return [fileIds, folderIds];
  revalidatePath(pathname); // revalidate folder path
  return [fileIds, folderIds];
}

export async function getAllSubFileIds(
  folderId: string,
  userId: string,
): Promise<[string[], string[]]> {
  const filesFolders = await database.parent.findMany({
    where: {
      folder_id: folderId,
      user_id: userId,
    },
  });

  const files = await database.file.findMany({
    select: {
      file_id: true,
    },
    where: {
      file_id: {
        in: filesFolders.map((ff) => ff.file_id),
      },
      user_id: userId,
    },
  });

  const folders = await database.folder.findMany({
    select: {
      folder_id: true,
    },
    where: {
      folder_id: {
        in: filesFolders.map((ff) => ff.file_id),
      },
      user_id: userId,
    },
  });

  // Perhaps computationally expensive but is being fetched from cache once done once
  const data = await Promise.all(
    folders.map(async (f) => {
      return await getAllSubFileIds(f.folder_id, userId);
    }),
  );
  
  // Turn all the data into a single array
  const allFiles = files
    .map((f) => f.file_id)
    .concat(data.map((d) => d[0]).flat());
  const allFolders = folders
    .map((f) => f.folder_id)
    .concat(data.map((d) => d[1]).flat());

  return [allFiles, allFolders];
}

export async function getSubFilesCount(
  folderId: string,
): Promise<[number, number]> {
  const user = await getUserFromSession();

  if (!user) return [0, 0];

  const [files, folders] = await getAllSubFileIds(folderId, user.user_id);

  return [files.length, folders.length];
}