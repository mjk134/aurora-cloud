import { cookies } from "next/headers";
import Input from "../../../../components/ui/input";
import FileDropzone from "../../../../components/file-dropzone";
import FileUpload from "../../../../components/modals/file-upload";
import { getUserFromSession } from "../../../../lib/session";
import database from "../../../../lib/database";
import { CreateFolderModal, FileBox, FolderBox } from "./components";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { createFolder, deleteFile, revalidateFiles } from "./actions";
import Button from "../../../../components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import path from "path";

// root param means folder id = 0
export default async function Files({
  params,
}: {
  params: Promise<{ dir: string[] }>;
}) {
  // Last item in param array is the folder id
  const asyncParams = await params;

  // If no folder id, redirect to root folder
  if (!asyncParams.dir) {
    redirect("/home/files/0");
  } else if (asyncParams.dir.length === 0) {
    redirect("/home/files/0");
  }

  // Get the folder id
  const folderId = asyncParams.dir[asyncParams.dir.length - 1];

  if (!folderId) {
    redirect("/home/files/0");
  }

  // Fetch all files and folders in root folder id: 0
  const user = await getUserFromSession();

  if (!user) {
    redirect("/login");
  }

  const folderFileIds = await database.parent.findMany({
    where: {
      user_id: user?.user_id,
      folder_id: asyncParams.dir.length === 1 ? "0" : folderId,
    },
  });

  // If no files or folders in root folder, return empty
  // if (folderFileIds.length === 0) {
  //     console.log(folderFileIds)
  //     redirect('/home/files/0')
  // }

  // Query file table to see what files are in the parent folder
  const files = await database.file.findMany({
    where: {
      file_id: {
        in: folderFileIds.map((folder) => folder.file_id),
      },
      user_id: user?.user_id,
    },
  });

  // Query folder table to see what folders are in the parent folder
  const folders = await database.folder.findMany({
    where: {
      folder_id: {
        in: folderFileIds.map((folder) => folder.file_id),
      },
      user_id: user?.user_id,
    },
  });

  const pathFolders = await database.folder.findMany({
    where: {
      folder_id: {
        in: asyncParams.dir,
      },
    },
  });

  const getHref = (folderId: string, index: number, folders: string[]) => {
    let href = "/home/files/";
    for (let i = 0; i < index; i++) {
      href += folders[i] + "/";
    }
    href += folderId;
    return href;
  };

  return (
    <div className="flex relative font-sans flex-col p-5 h-screen w-full">
      <h1 className="text-4xl font-bold">All Files</h1>
      <p className="text-lg">
        The best place to upload and manage your files. Drag files in to begin
        uploading. Right-click files to manage them.
      </p>
      <Input placeholder="Search files" />
      <div className="flex relative flex-col h-full w-full overflow-hidden">
        <div className="flex gap-2">
          {pathFolders.map((folder, index) => {
            return (
              <div key={folder.folder_id} className="flex items-center gap-2">
                <span className="text-2xl">/</span>
                <Link
                  href={getHref(
                    folder.folder_id,
                    index,
                    pathFolders.map((f) => f.folder_id),
                  )}
                  className="text-xl font-medium mt-3 pb-4"
                >
                  {folder.name}
                </Link>
              </div>
            );
          })}
        </div>
        <FileDropzone
          currentFolderId={folderId}
          userId={user?.user_id}
          deleteFile={deleteFile}
          className="grid md:grid-cols-3 lg:grid-cols-5 grid-rows-auto gap-4 overflow-scroll pb-32"
          files={files}
          folders={folders.filter((folder) => folder.folder_id !== "0")}
        />
        <CreateFolderModal
          createFolder={createFolder}
          currentFolderId={folderId}
        />
      </div>
    </div>
  );
}
