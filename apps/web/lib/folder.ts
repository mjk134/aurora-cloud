import { FolderFileTree } from "../types";
import database from "./database";
import { getUserFromSession } from "./session";

export async function getFolderPath(folderId: string) {
  const user = await getUserFromSession();

  if (!user) {
    return "";
  }

  return await getFolderPathPublic(folderId, user.user_id);
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

export async function getTreeMapData(userId: string) {
  const rootFolder = await database.folder.findFirst({
    where: {
      user_id: userId,
      is_root: true,
    },
  });

  if (!rootFolder) {
    return {
      name: "Home",
      children: [],
    };
  }

  // Traverse the folder tree
  const getFolderData = async (folderId: string): Promise<FolderFileTree> => {
    const folder = await database.folder.findFirst({
      where: {
        folder_id: folderId,
      },
    });

    if (!folder) {
      return {
        name: "",
        children: [],
      };
    }

    const children = await database.parent.findMany({
      where: {
        folder_id: folder.folder_id,
      },
    });

    const folders = await database.folder.findMany({
      where: {
        folder_id: {
          in: children.map((child) => child.file_id),
        },
        user_id: userId,
      },
    });

    const files = await database.file.findMany({
      where: {
        file_id: {
          in: children.map((child) => child.file_id),
        },
      },
    });

    return {
      name: folder.name,
      children: [
        ...files.map((file) => {
          return {
            name: file.file_name,
            size: Number(String(file.file_size)),
          };
        }),
        ...(await Promise.all(
          folders.map(async (f) => {
            return await getFolderData(f.folder_id);
          }),
        )),
      ],
    };
  };

  return await getFolderData(rootFolder.folder_id);
}
