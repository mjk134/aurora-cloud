import { Suspense } from "react";
import FileSizeBarChart from "../../components/analysis/file-size-bar-chart";
import FileTypeBarChart from "../../components/analysis/file-type-bar-chart";
import SearchFiles from "../../components/files-search";
import RecentFiles from "../../components/recent-files";
import database from "../../lib/database";
import { getUserFromSession } from "../../lib/session";
import { deleteFile } from "./files/[[...dir]]/actions";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="font-sans grid grid-cols-1 grid-rows-3 items-center h-screen w-full p-10">
      <div className="flex flex-col justify-end row-span-1 items-center">
        <div className="flex flex-col">
          <h1 className="text-8xl font-bold leading-[.9]">
            Welcome to Aurora Cloud
          </h1>
          <p className="pb-2 text-md ">
            Begin looking find your files using the search bar below. To upload files navigate to the <Link href="/home/files" className="blue underline">files</Link> page.
          </p>
        </div>
        <div className="w-full px-24">
          <SearchFiles />
        </div>
      </div>
      <div className="grid grid-cols-2 grid-rows-1 row-span-2 h-full w-full">
        <div className="flex flex-col gap-3 overflow-scroll">
          <div className="text-2xl font-semibold">Recent files</div>
          <RecentFiles
            className="grid grid-cols-2 gap-3 grid-rows-auto"
            deleteFile={deleteFile}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-2xl font-semibold">Analysis</div>
          <Suspense
            fallback={
              <div className="animate-pulse h-full w-full rounded bg-gray-100"></div>
            }
          >
            <Analysis />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function Analysis() {
  const user = await getUserFromSession();

  if (!user) {
    return;
  }

  const types: {
    type: string;
    count: number;
  }[] = [];

  // Get the most common file types
  const files = await database.file.findMany({
    where: { user_id: user.user_id },
    select: { file_type: true },
  });

  files.forEach((file) => {
    const type = file.file_type;
    const index = types.findIndex((x) => x.type === type);
    if (index === -1) {
      types.push({ type, count: 1 });
    } else {
      if (types[index]?.count) {
        types[index].count += 1;
      }
    }
  });

  const fileSizes = await database.file.findMany({
    where: { user_id: user.user_id },
    select: { file_size: true, file_name: true },
    orderBy: { file_size: "desc" },
    take: 8,
  });

  const nothingToAnalyse = types.length === 0 && fileSizes.length === 0;

  return (
    <div className="flex flex-col overflow-scroll">
      {nothingToAnalyse ? (
        <p className="text-gray-500 text-lg">No files to analyse. Begin uploading to see your analysis.</p>
      ) : (
        <>
          <div className="flex flex-col justify-center items-center">
            <div className="text-xl font-medium mt-3 pb-4">
              File Sizes (top 10)
            </div>
            <FileSizeBarChart fileSizes={fileSizes} />
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-xl font-medium mt-3 pb-4">File types</div>
            <FileTypeBarChart fileTypes={types.splice(0, 8)} />
          </div>
        </>
      )}
    </div>
  );
}
