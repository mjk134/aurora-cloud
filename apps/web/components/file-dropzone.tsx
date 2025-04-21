"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../lib/style";
import { WebsocketEventUnion } from "@repo/types";
import { Folder, Prisma } from "@prisma/client";
import { FileBox, FolderBox } from "../app/home/files/[[...dir]]/components";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { tryCatch } from "@repo/util";
import { url } from "../lib/url";

export default function FileDropzone({
  files,
  folders,
  className,
  userId,
  deleteFile,
  currentFolderId,
  children,
}: {
  folders: Folder[];
  files: Prisma.FileGetPayload<{
    select: {
      file_id: true;
      file_name: true;
      file_size: true;
      created_at: true;
      user_id: true;
      file_type: true;
    };
  }>[];
  className?: string;
  userId: string;
  deleteFile: (fileId: string, path: string) => Promise<void>;
  currentFolderId: string;
  children?: React.ReactNode;
}) {
  const [showInput, setShowInput] = useState(false);
  const [dragging, setDragging] = useState(false);
  const socket = useRef<WebSocket>(null);
  const router = useRouter();
  const [pendingFiles, setFiles] = useState<
    {
      fileId: string;
      filename?: string;
      toastId: string | number;
      status: "uploading" | "downloading";
    }[]
  >([]);

  // Not sure if this is needed but good to have
  const updateFiles = useCallback(
    (data: WebsocketEventUnion) => {
      switch (data.event) {
        case "init":
          console.log(
            "[Client Socket] Started proccessing file with id:",
            data.fileId,
            data,
          );
          if (data.type === "downloading") {
            const toastId = toast.loading(`Downloading ${data.file_name}...`);
            setFiles((files) => {
              return [
                ...files,
                {
                  fileId: data.fileId,
                  filename: data.file_name,
                  status: "downloading",
                  toastId,
                },
              ];
            });
          }
          break;
        case "chunk":
          console.log(
            "[Client Socket] Received chunk for file with id:",
            data.fileId,
            data,
          );

          const file = pendingFiles.find((file) => file.fileId === data.fileId);
          if (!file) return;
          if (file.status === "uploading") {
            toast.loading(
              `Uploading ${file.filename}, ${(data.progress * 100).toFixed(
                0,
              )}% complete...`,
              {
                id: file.toastId,
              },
            );
          }

          if (file.status === "downloading") {
            toast.loading(
              `Downloading ${file.filename}, ${(data.progress * 100).toFixed(
                0,
              )}% complete...`,
              {
                id: file.toastId,
              },
            );
          }

          break;
        case "complete":
          console.log(
            "[Client Socket] Completed file with id:",
            data.fileId,
            data,
          );

          const completedFile = pendingFiles.find(
            (file) => file.fileId === data.fileId,
          );
          if (!completedFile) return;
          if (completedFile.status === "uploading") {
            toast.success(`Uploaded ${completedFile.filename}!`, {
              id: completedFile.toastId,
            });
          }

          if (completedFile.status === "downloading") {
            toast.success(`Downloaded ${completedFile.filename}!`, {
              id: completedFile.toastId,
            });
          }

          // Remove the file from the pending files
          setFiles(pendingFiles.filter((file) => file.fileId !== data.fileId));
          router.refresh();
          break;
        case "error":
          console.log(
            "[Client Socket] Error with file with id:",
            data.fileId,
            data,
          );
          const errorFile = pendingFiles.find(
            (file) => file.fileId === data.fileId,
          );
          if (!errorFile) return;
          toast.error(
            `An error occured when proccessing ${errorFile.filename}`,
            {
              id: errorFile.toastId,
            },
          );
          setFiles(pendingFiles.filter((file) => file.fileId !== data.fileId));
          break;
      }
    },
    [pendingFiles, router],
  );

  useEffect(() => {
    const websocket = new WebSocket(`${url()}/api/socket`);
    websocket.onopen = () => {
      console.log("[Client Socket] Connected to websocket server");
      websocket.send(
        Buffer.from(JSON.stringify({ user_id: userId }), "utf-8").toString(
          "base64",
        ),
      );
    };
    websocket.onmessage = (message) => {
      const data = JSON.parse(
        Buffer.from(JSON.parse(message.data).data).toString(),
      ) as WebsocketEventUnion | undefined;
      if (!data) return;
      updateFiles(data);
    };
    websocket.onclose = () => {
      console.log("[Client Socket] Disconnected from websocket server");
    };

    socket.current = websocket;

    return () => {
      socket.current?.close();
    };
  }, [pendingFiles, setFiles, updateFiles, userId]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
    setShowInput(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setShowInput(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setShowInput(false);
    // Handle the file drop here
    const files = e.dataTransfer.files;

    // Maybe promise.all this??
    for (const file of files) {
      // Check file length
      if (file.size === 0) {
        toast.error(
          `File ${file.name} is empty! This service only supports files with content.`,
        );
        continue;
      }

      if (file.size > 2147483648) {
        console.log("[File Size Error]", file.size);
        toast.error(
          `File ${file.name} is too large! This service only supports files up to 2GB.`,
        );
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      const tempId = Math.random().toString(36).substring(1);
      const toastId = toast.loading(`Uploading ${file.name}...`);
      setFiles((files) => [
        ...files,
        {
          fileId: tempId,
          filename: file.name,
          status: "uploading",
          toastId: toastId,
        },
      ]);
      const result = await tryCatch<Response>(
        fetch(`/api/upload?folderId=${currentFolderId}&tempFileId=${tempId}`, {
          method: "POST",
          body: formData,
        }),
      );

      if (!result.success) {
        toast.error(
          `Error uploading ${file.name}, check console for more info.`,
        );
        console.log("[Upload Error]", result.value);
        setFiles((files) => files.filter((f) => f.fileId !== tempId));
        continue;
      } else {
        const data = await result.value.json();
        if (!data.success) {
          toast.error(
            `Error uploading ${file.name}, check console for more info.`,
          );
          console.log("[Upload Error]", data);
          setFiles((files) => files.filter((f) => f.fileId !== tempId));
          continue;
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={cn("w-full h-full relative", className)}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {folders.map((folder) => (
        <FolderBox key={folder.folder_id} folder={folder} />
      ))}
      {files.map((file) => (
        <FileBox key={file.file_id} file={file} deleteFile={deleteFile} />
      ))}
      {children}
    </div>
  );
}
