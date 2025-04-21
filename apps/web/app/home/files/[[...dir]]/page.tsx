import FileDropzone from "../../../../components/file-dropzone";
import { getUserFromSession } from "../../../../lib/session";
import database from "../../../../lib/database";
import { redirect } from "next/navigation";
import { createFolder, deleteFile } from "./actions";
import { FolderPlus } from "lucide-react";
import Link from "next/link";
import { CreateFolderModal } from "../../../../components/modals/create-folder";
import SearchFiles from "../../../../components/files-search";

// root param means folder id = 0
export default async function Files({
  params,
}: {
  params: Promise<{ dir: string[] }>;
}) {
  // Last item in param array is the folder id
  const asyncParams = await params;

  // Fetch all files and folders in root folder id: 0
  const user = await getUserFromSession();

  if (!user) {
    redirect("/login");
  }

  const rootFolder = await database.folder.findFirst({
    where: {
      user_id: user?.user_id,
      is_root: true,
    },
  });

  // If no folder id, redirect to root folder
  if (!asyncParams.dir) {
    redirect("/home/files/" + rootFolder?.folder_id);
  } else if (asyncParams.dir.length === 0) {
    redirect("/home/files/" + rootFolder?.folder_id);
  } else if (asyncParams.dir[0] !== rootFolder?.folder_id) {
    redirect("/home/files/" + rootFolder?.folder_id);
  }

  // Get the folder id
  const folderId = asyncParams.dir[asyncParams.dir.length - 1];

  if (!folderId) {
    redirect("/home/files/" + rootFolder?.folder_id);
  }

  const folderFileIds = await database.parent.findMany({
    where: {
      user_id: user?.user_id,
      folder_id: folderId,
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

  if (folderFileIds.length === 0) {
    return (
      <div className="flex relative font-sans flex-col p-5 h-screen w-full">
        <h1 className="text-5xl font-bold">All Files</h1>
        <p className="text-lg">
          The best place to upload and manage your files. Drag files in to begin
          uploading. Right-click files to manage them.
        </p>
        <SearchFiles />
        <div className="@container flex relative flex-col h-full w-full overflow-hidden">
          <div className="flex gap-2">
            {/* TODO: Prevent re-render */}
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
            className="flex justify-center items-center"
            files={[]}
            folders={[]}
          >
            <div className="flex flex-col items-center gap-4">
              <FolderPlus size={80} strokeWidth={0.5} />
              <p className="text-xl font-light">
                No files here. Drag files in to begin uploading.
              </p>
            </div>
          </FileDropzone>
          <CreateFolderModal
            createFolder={createFolder}
            currentFolderId={folderId}
          />
        </div>
      </div>
    );
  }

  // Query file table to see what files are in the parent folder
  const files = await database.file.findMany({
    where: {
      file_id: {
        in: folderFileIds.map((folder) => folder.file_id),
      },
      user_id: user.user_id,
    },
    select: {
      file_id: true,
      file_name: true,
      file_size: true,
      created_at: true,
      user_id: true,
      file_type: true,
    }
  });

  // Query folder table to see what folders are in the parent folder
  const folders = await database.folder.findMany({
    where: {
      folder_id: {
        in: folderFileIds.map((folder) => folder.file_id),
      },
      user_id: user.user_id,
    },
  });

  return (
    <div className="flex relative font-sans flex-col p-5 h-screen w-full">
      <h1 className="text-5xl font-bold">All Files</h1>
      <p className="text-lg">
        The best place to upload and manage your files. Drag files in to begin
        uploading. Right-click files to manage them.
      </p>
      <SearchFiles />
      <div className="@container flex relative flex-col h-full w-full overflow-hidden">
        <div className="flex gap-2">
          {/* TODO: Prevent re-render */}
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
          className="grid grid-cols-4 @md:grid-cols-5 @lg:grid-cols-6 grid-rows-auto gap-4 overflow-scroll pb-32"
          files={files}
          folders={folders.filter(
            (folder) => folder.folder_id !== rootFolder?.folder_id,
          )}
        />
        <CreateFolderModal
          createFolder={createFolder}
          currentFolderId={folderId}
        />
      </div>
    </div>
  );
}
