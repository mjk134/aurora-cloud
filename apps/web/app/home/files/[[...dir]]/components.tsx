"use client";

import { File, Folder } from "@prisma/client";
import {
  FileArchive,
  FileIcon,
  FileImage,
  FileText,
  Folder as FolderIcon,
} from "lucide-react";
import Button from "../../../../components/ui/button";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import { AlertDialog, ContextMenu } from "radix-ui";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { deleteFolder, getSubFilesCount } from "./actions";

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
  }, [file.file_type]);

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
  const [, setContextMenuOpen] = React.useState(false);
  const [pending, setTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [folderFileCount, setFolderFileCount] = useState([0, 0]);
  
    useEffect(() => {
      const fetchFolderFileCount = async () => {
        const count = await getSubFilesCount(folder.folder_id);
        setFolderFileCount(count);
      }
  
      if (isOpen) {
        setContextMenuOpen(false);
        fetchFolderFileCount();
      }
  
    }, [folder, isOpen, setContextMenuOpen]);

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <ContextMenu.Root onOpenChange={setContextMenuOpen}>
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
            <ContextMenu.Item asChild className="group font-sans hover:bg-red-100 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[14px] leading-none outline-none data-[disabled]:pointer-events-none ">
              <AlertDialog.Trigger asChild>
                <div onClick={() => {
                  console.log("Delete folder");
                  setIsOpen(true);
                }} className="group font-sans hover:bg-red-100 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[14px] leading-none outline-none data-[disabled]:pointer-events-none ">
                  Delete{" "}
                </div>
              </AlertDialog.Trigger>
             </ContextMenu.Item>
          </motion.div>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
		<AlertDialog.Portal>
			<AlertDialog.Overlay className="fixed inset-0 bg-gray backdrop-blur-sm data-[state=open]:animate-overlayShow" />
			<AlertDialog.Content className="fixed border border-solid border-gray-100 font-sans left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
				<AlertDialog.Title className="m-0 text-[17px] font-medium text-mauve12">
					Are you sure you want to delete this folder?
				</AlertDialog.Title>
				<AlertDialog.Description className="mb-5 mt-[15px] text-[15px] leading-normal text-mauve11">
					This action cannot be undone. This will permanently delete {folderFileCount[0]} file(s) and {folderFileCount[1]} folder(s).
				</AlertDialog.Description>
				<div className="flex justify-end gap-[25px]">
					<AlertDialog.Cancel asChild>
						<Button disabled={pending} variant="unselected">
							Cancel
						</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action asChild>
						<Button onClick={() => {
              setTransition(() => {
                deleteFolder(folder.folder_id, pathname);
              });
            }} loading={pending} variant="danger">
            Delete folder
						</Button>
					</AlertDialog.Action>
				</div>
			</AlertDialog.Content>
		</AlertDialog.Portal>
	</AlertDialog.Root>

  );
}
