"use client";

import { File, Folder } from "@prisma/client";
import {
  FileArchive,
  FileIcon,
  FileImage,
  FileMusic,
  FileText,
  FileVideo,
  Folder as FolderIcon,
  Plus,
  X,
} from "lucide-react";
import { cn } from "../../../../lib/style";
import Button from "../../../../components/ui/button";
import React, { useCallback, useTransition } from "react";
import { ContextMenu, Dialog } from "radix-ui";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import Input from "../../../../components/ui/input";
import Link from "next/link";
import { start } from "repl";

export function FileBox({
  file,
  deleteFile,
}: {
  file: File;
  deleteFile: (fileId: string, path: string) => Promise<void>;
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const getFileIcon = useCallback(() => {
    if (file.file_type.includes("image")) {
      return <FileImage size={64} strokeWidth={1} />;
    }
    if (file.file_type.includes("pdf")) {
      return <FileText size={64} strokeWidth={1} />;
    }
    if (file.file_type.includes("zip")) {
      return <FileArchive size={64} strokeWidth={1} />;
    } else {
      return <FileIcon size={64} strokeWidth={1} />;
    }
  }, []);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex relative flex-col gap-1 h-[150px] w-[150px] md:h-[200px] md:w-[200px] lg:h-[240px] lg:w-[240px] justify-center text-center p-2 items-center border border-solid font-light text-sm border-gray-600 rounded-lg"
        >
          {getFileIcon()}
          {file.file_name.length > 150
            ? file.file_name.slice(0, 150) + "..."
            : file.file_name}
          {isPending && (
            <div className="absolute inset-0 flex justify-center items-center bg-gray-100 bg-opacity-50 rounded-lg">
              <div className="flex flex-col gap-2 animate-pulse items-center">
                <div className="w-5 h-5 border-2 border-solid border-gray-600 rounded-full animate-spin"></div>
                <div>Processing...</div>
              </div>
            </div>
          )}
        </motion.div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content asChild>
          <motion.div
            animate={{ scale: 1 }}
            initial={{ scale: 0.5 }}
            className="min-w-[220px] overflow-hidden rounded-md bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
          >
            <ContextMenu.Item
              onClick={() => {
                startTransition(() => {
                  deleteFile(file.file_id, pathname);
                });
              }}
              disabled={isPending}
              className="group font-sans hover:bg-red-100 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[14px] leading-none outline-none data-[disabled]:pointer-events-none "
            >
              Delete{" "}
            </ContextMenu.Item>
            <ContextMenu.Item asChild>
              <Link
                href={"/api/download/" + file.file_id}
                target="_blank"
                className="group font-sans hover:bg-blue-100 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[14px] leading-none outline-none data-[disabled]:pointer-events-none "
              >
                Download
              </Link>
            </ContextMenu.Item>
          </motion.div>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

export function FolderBox({ folder }: { folder: Folder }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => router.push(`${pathname}/${folder.folder_id}`)}
          className="flex relative hover:cursor-pointer flex-col h-[150px] w-[150px] md:h-[200px] md:w-[200px] lg:h-[240px] lg:w-[240px] justify-center text-center p-2 items-center border border-solid font-light text-sm border-gray-600 rounded-lg"
        >
          <FolderIcon size={80} strokeWidth={1} />
          {folder.name}
        </motion.div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content asChild>
          <motion.div
            animate={{ scale: 1 }}
            initial={{ scale: 0.5 }}
            className="min-w-[220px] overflow-hidden rounded-md bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
          >
            <ContextMenu.Item className="group font-sans hover:bg-red-100 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[14px] leading-none outline-none data-[disabled]:pointer-events-none ">
              Delete{" "}
            </ContextMenu.Item>
          </motion.div>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
