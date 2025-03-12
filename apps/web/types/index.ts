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

export interface LocalStorageSchema {
  recentFolders: {
    folderId: string;
    folderName: string;
    folderPath: string;
  }[];
}
