import database from "./database";
import { getUserFromSession } from "./session";

export async function getFolderPath(folderId: string) {
  const user = await getUserFromSession();

  if (!user) {
    return "";
  }

  const rootFolder = await database.folder.findFirst({
    where: {
      user_id: user.user_id,
      is_root: true,
    },
  });

  if (!rootFolder) {
    return "";
  }

  if (folderId === rootFolder.folder_id) {
    return "/home/files/" + folderId;
  }

  const folderIds = [folderId];
  let currentFolderId = folderId;

  while (currentFolderId !== rootFolder.folder_id) {
    const parent = await database.parent.findFirst({
      where: {
        file_id: currentFolderId,
        user_id: user.user_id,
      },
    });

    if (!parent) {
      break;
    }

    folderIds.push(parent?.folder_id);
    currentFolderId = parent?.folder_id;
  }

  return "/home/files/" + folderIds.reverse().join("/");
}

export async function getFolderPathPublic(folderId: string, userId: string) {
  const rootFolder = await database.folder.findFirst({
    where: {
      user_id: userId,
      is_root: true,
    },
  });

  if (!rootFolder) {
    return "";
  }

  if (folderId === rootFolder.folder_id) {
    return "/home/files/" + folderId;
  }

  const folderIds = [folderId];
  let currentFolderId = folderId;

  while (currentFolderId !== rootFolder.folder_id) {
    const parent = await database.parent.findFirst({
      where: {
        file_id: currentFolderId,
        user_id: userId,
      },
    });

    if (!parent) {
      break;
    }

    folderIds.push(parent?.folder_id);
    currentFolderId = parent?.folder_id;
  }

  return "/home/files/" + folderIds.reverse().join("/");
}

