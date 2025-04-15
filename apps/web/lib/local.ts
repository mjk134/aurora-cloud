"use client";
import { LocalStorageSchema } from "../types";

export function setTypedStorageItem<T extends keyof LocalStorageSchema>(
  key: T,
  value: LocalStorageSchema[T],
): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getTypedStorageItem<T extends keyof LocalStorageSchema>(
  key: T,
): LocalStorageSchema[T] | null {
  if (typeof window === "undefined") return null;
  const item = window.localStorage.getItem(key);
  return !item ? null : (JSON.parse(item) as LocalStorageSchema[T]);
}

export function setFolderClicked(
  folderId: string,
  folderName: string,
  folderPath: string,
) {
  const folders = getTypedStorageItem("recentFolders");

  if (!folders) {
    setTypedStorageItem("recentFolders", [
      { folderId, folderName, folderPath },
    ]);
    return;
  }

  const folderIndex = folders.findIndex(
    (folder) => folder.folderId === folderId,
  );


  if (folderIndex === -1) {
    // Check if the length is greater than 10
    if (folders.length >= 5) {
      folders.shift();
    }

    folders.push({ folderId, folderName, folderPath });
  }

  setTypedStorageItem("recentFolders", folders);
}


export function setFileClicked(
  fileId: string,
  fileName: string,
  folderPath: string, // Should be of the form /home/files/.../cuid#file_id
) {
  const files = getTypedStorageItem("recentFiles");

  if (!files) {
    setTypedStorageItem("recentFiles", [{ fileId, fileName, folderPath }]);
    return;
  }

  const fileIndex = files.findIndex((file) => file.fileId === fileId);

  if (fileIndex === -1) {
    // Check if the length is greater than 10
    if (files.length >= 6) {
      files.shift();
    }

    files.push({ fileId, fileName, folderPath });
  }
  setTypedStorageItem("recentFiles", files);
}