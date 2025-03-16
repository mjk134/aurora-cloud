import { File, Folder } from "@prisma/client";
import Files from "../../../components/files";
import SearchFiles from "../../../components/files-search";
import { deleteFile } from "../files/[[...dir]]/actions";
import { cn } from "../../../lib/style";
import { SearchX } from "lucide-react";
import { Suspense } from "react";
import database from "../../../lib/database";
import { getUserFromSession } from "../../../lib/session";

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const asyncSearchParams = await searchParams;
  let folders: Folder[] = [];
  let files: File[] = [];
  const user = await getUserFromSession();

  if (!user) {
    return;
  }

  const query = asyncSearchParams.q as string | undefined;

  if (query) {
    // Query files and folders
    files = await database.file.findMany({
      where: {
        file_name: {
          contains: query,
        },
        user_id: user.user_id,
      },
    });
    folders = await database.folder.findMany({
      where: {
        name: {
          contains: query,
        },
        user_id: user.user_id,
      },
    });

  }

  return (
    <div className="flex relative font-sans flex-col p-5 h-screen w-full">
      <h1 className="text-4xl font-bold">Search Files</h1>
      <p className="text-lg">
        {query ? (
          <>
            Search results for{" "}
            <span className="font-semibold text-blue-400">{query}</span>
          </>
        ) : (
          "Search for files and folders"
        )}
      </p>
      <SearchFiles initalSearch={query} />
      <div className="@container flex relative flex-col h-full w-full overflow-hidden">
        <div className="flex gap-2 my-2 font-bold text-xl">Search Results</div>
        <Suspense fallback={<div>Searching...</div>}>
          <Files
            files={files}
            folders={folders}
            deleteFile={deleteFile}
            className={
              files.length === 0 && folders.length === 0
                ? "flex justify-center items-center"
                : "grid grid-cols-4 @md:grid-cols-5 @lg:grid-cols-6 grid-rows-auto gap-4 overflow-scroll pb-32"
            }
          >
            {files.length === 0 && folders.length === 0 && (
              <div className="flex flex-col items-center gap-4">
                <SearchX size={80} strokeWidth={0.5} />
                <p className="text-xl font-light">
                  No files or folders found. Try searching for something else.
                </p>
              </div>
            )}
          </Files>
        </Suspense>
      </div>
    </div>
  );
}
