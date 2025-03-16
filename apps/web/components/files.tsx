import { Folder, File } from "@prisma/client";
import { cn } from "../lib/style";
import { FileBox, FolderBox } from "../app/home/files/[[...dir]]/components";
import { getFolderPath } from "../lib/folder";

export default async function Files({
  files,
  folders,
  className,
  deleteFile,
  children,
}: {
  folders: Folder[];
  files: File[];
  className?: string;
  deleteFile: (fileId: string, path: string) => Promise<void>;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("w-full h-full relative", className)}>
      {folders.map(async (folder) => {
        // Get folder link
        const path = await getFolderPath(folder.folder_id);
        return (
          <FolderBox key={folder.folder_id} folder={folder} customLink={path} />
        );
      })}
      {files.map((file) => (
        <FileBox key={file.file_id} file={file} deleteFile={deleteFile} />
      ))}
      {children}
    </div>
  );
}
