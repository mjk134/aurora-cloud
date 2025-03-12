import database from "./database";
import { getUserFromSession } from "./session";

export async function getFolderPath(folderId: string) {
  const user = await getUserFromSession();

  if (!user) {
    return "";
  }

  if (folderId === "0") {
    return "/home/files/0";
  }

  const folderIds = [folderId];
  let currentFolderId = folderId;

  while (currentFolderId !== "0") {
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
