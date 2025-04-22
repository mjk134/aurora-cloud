"use client";

import { Folder, Prisma } from "@prisma/client";
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
import { deleteFolder, getSubFilesCount } from "./actions";
import {
  removeFileClicked,
  removeFolderClicked,
  setFileClicked,
  setFolderClicked,
} from "../../../../lib/local";
import { toast } from "sonner";
import { tryCatch } from "@repo/util";

// Some previewable types
const textFileTypes = [
  "text/plain",
  "text/html",
  "text/css",
  "text/javascript",
  "text/xml",
  "application/json",
];

export function FileBox({
  file,
  deleteFile,
  customFolderLink,
}: {
  // Type the file prop correctly
  file: Prisma.FileGetPayload<{
    select: {
      file_id: true;
      file_name: true;
      file_size: true;
      created_at: true;
      user_id: true;
      file_type: true;
    };
  }>;
  // Server action needs to be passed in as prop
  deleteFile: (fileId: string, path: string) => Promise<void>;
  customFolderLink?: string;
}) {
  const pathname = usePathname();
  /**
   * This hook is needed to prevent the user from spamming requests for a single file
   * Other files can have actions done simultaneously since they are not in the same state
   */
  const [isPending, startTransition] = useTransition();
  const [isContextMenuOpen, setContextMenuOpen] = React.useState(false);
  const isPreviewable =
    textFileTypes.includes(file.file_type) || file.file_type.includes("image");
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

  const handleDownload = useCallback(async () => {
    if (isPending) return;
    const result = await tryCatch<Response>(
      fetch("/api/download/" + file.file_id),
    );
    if (!result.success) {
      toast.error("Failed to download file. Please try again.");
      return;
    }
    // Separate the actual error handling from the request
    if (!result.value.ok) {
      toast.error("Failed to download file. Please try again.");
      return;
    }
    // This is the response from the server, its handled using blobs on the client
    const res = result.value;
    const blob = await res.blob();

    // This prevents redirecting and the download happens in the background
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  const handlePreview = useCallback(async () => {
    if (isPreviewable) {
      const previewWindow = window.open(
        `/api/download/${file.file_id}?preview=true`,
        "_blank",
      );
      if (!previewWindow) {
        alert("Please allow popups for this website");
      }
    } else {
      await handleDownload();
    }
  }, [isPreviewable, handleDownload]);

  return (
    <ContextMenu.Root onOpenChange={setContextMenuOpen}>
      <ContextMenu.Trigger
        data-state={isContextMenuOpen ? "open" : "closed"}
        asChild
      >
        <motion.div
          id={file.file_id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onDoubleClick={() => {
            if (isPending) return;
            setFileClicked(
              file.file_id,
              file.file_name,
              customFolderLink ? customFolderLink : pathname,
            );
            startTransition(async () => {
              await handlePreview();
            });
            toast.warning(
              "No preview available for this file type, downloading instead.",
            );
          }}
          className="flex relative flex-col gap-1 h-[150px] w-[150px] md:h-[200px] md:w-[200px] lg:h-[240px] lg:w-[240px] justify-center text-center p-2 items-center border border-solid font-light text-sm border-gray-600 rounded-lg"
        >
          {getFileIcon()}
          {file.file_name.length > 150
            ? file.file_name.slice(0, 150) + "..."
            : file.file_name}
          {isPending && (
            <div className="absolute inset-0 flex justify-center items-center bg-gray backdrop-blur-sm rounded-lg">
              <div className="flex flex-col gap-2 animate-pulse items-center">
                <div className="loader" />
                <div>Processing...</div>
              </div>
            </div>
          )}
        </motion.div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          data-state={isContextMenuOpen ? "open" : "closed"}
          asChild
        >
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
              <button
                disabled={isPending}
                onClick={() => {
                  setFileClicked(file.file_id, file.file_name, pathname);
                  startTransition(async () => {
                    await handleDownload();
                  });
                }}
                className="group w-full font-sans hover:bg-blue-100 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[14px] leading-none outline-none data-[disabled]:pointer-events-none "
              >
                Download
              </button>
            </ContextMenu.Item>
          </motion.div>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

export function FolderBox({
  folder,
  customLink,
}: {
  folder: Folder;
  customLink?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, setContextMenuOpen] = React.useState(false);
  const [pending, setTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [folderFileCount, setFolderFileCount] = useState([0, 0]);
  const [deletedFoldersFiles, setDeletedFoldersFiles] = useState<
    [string[], string[]] | null
  >(null);

  useEffect(() => {
    // This hook is called when the isOpen state changes
    // So when the dialog opens, only then we can get the file count
    // This prevents all folders calling it at once
    // and causing a lot of requests
    if (isOpen) {
      setContextMenuOpen(false);
      setTransition(async () => {
        const count = await getSubFilesCount(folder.folder_id);
        setFolderFileCount(count);
      });
    }
  }, [folder, isOpen, setContextMenuOpen]);

  useEffect(() => {
    if (deletedFoldersFiles === null) return;
    const [deletedFiles, deletedFolders] = deletedFoldersFiles;
    // remove it from local storage
    for (const fileId of deletedFiles) {
      removeFileClicked(fileId);
    }

    // remove it from recent folders
    for (const folderId of deletedFolders) {
      removeFolderClicked(folderId);
    }

    // Remove root
    removeFolderClicked(folder.folder_id);
    // Show toast
    toast.success(
      `Deleted ${deletedFiles.length} file(s) and ${
        deletedFolders.length + 1
      } folder(s)`,
    );

    router.refresh();
    setDeletedFoldersFiles(null);
  }, [deletedFoldersFiles, folder.folder_id]);

  return (
    // AlertDialog is used to confirm the deletion of the folder
    // ContextMenu is used to show the delete option
    <AlertDialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <ContextMenu.Root onOpenChange={setContextMenuOpen}>
        <ContextMenu.Trigger asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => {
              setFolderClicked(
                folder.folder_id,
                folder.name,
                customLink ? customLink : `${pathname}/${folder.folder_id}`,
              );
              router.push(
                customLink ? customLink : `${pathname}/${folder.folder_id}`,
              );
            }}
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
              <ContextMenu.Item
                asChild
                className="group font-sans hover:bg-red-100 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[14px] leading-none outline-none data-[disabled]:pointer-events-none "
              >
                <AlertDialog.Trigger asChild>
                  <div
                    onClick={() => {
                      console.log("Delete folder");
                      setIsOpen(true);
                    }}
                    className="group font-sans hover:bg-red-100 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[14px] leading-none outline-none data-[disabled]:pointer-events-none "
                  >
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
            This action cannot be undone. This will permanently delete{" "}
            {folderFileCount[0]} file(s) and {folderFileCount[1]} folder(s).
          </AlertDialog.Description>
          <div className="flex justify-end gap-[25px]">
            <AlertDialog.Cancel asChild>
              <Button disabled={pending} variant="unselected">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                onClick={() => {
                  setTransition(async () => {
                    const folderFiles = await deleteFolder(
                      folder.folder_id,
                      pathname,
                    );
                    setDeletedFoldersFiles(folderFiles);
                  });
                }}
                loading={pending}
                variant="danger"
              >
                Delete folder
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
