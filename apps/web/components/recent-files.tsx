"use client";

import { useEffect, useState, useTransition } from "react";
import { File } from "@prisma/client";
import { getTypedStorageItem } from "../lib/local";
import { getFiles } from "../app/home/actions";
import { cn } from "../lib/style";
import { FileBox } from "../app/home/files/[[...dir]]/components";

export default function RecentFiles({
  deleteFile,
  className,
}: {
  deleteFile: (fileId: string, pathname: string) => Promise<void>;
  className?: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // No depenencies, so this will only run once
    const setLocalFiles = async () => {
      const localFiles = getTypedStorageItem("recentFiles");
      console.log(localFiles);
      const serverFiles = await getFiles(
        localFiles?.map((file) => file.fileId) ?? [],
      );
      setFiles(serverFiles);
    };
    startTransition(async () => {
      await setLocalFiles();
    });
  }, []);

  return (
    <div className={cn("w-full h-full relative", className)}>
      {files.map((file) => (
        <FileBox key={file.file_id} file={file} deleteFile={deleteFile} />
      ))}
      {files.length === 0 && !pending && (
        <p className="text-gray-500 text-lg">No recent files</p>
      )}
      {pending && (
        <p className="text-gray-500 text-lg">Loading recent files...</p>
      )}
    </div>
  );
}
