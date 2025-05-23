// For server actions with forms
export type FormActionResponse = {
  error: boolean;
  message: string;
  location?: string;
  values?: Record<string, string>;
};
export type FormAction<T> = (
  prevState: T,
  data: FormData,
) => Promise<FormActionResponse | void>;

// For the local storage schema
export interface LocalStorageSchema {
  recentFolders: {
    folderId: string;
    folderName: string;
    folderPath: string;
  }[];
  recentFiles: {
    fileId: string;
    fileName: string;
    folderPath: string;
  }[];
}

// For the file tree map
export type FileTreeObjType = {
  name: string;
  size: number;
}

export type FolderFileTree = {
  name: string;
  children: (FileTreeObjType | FolderFileTree)[];
}
