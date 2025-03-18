import { cookies } from "next/headers";
import TestForm from "../components";
import SearchFiles from "../../components/files-search";

export default async function Home() {
  return (
    <div className="font-sans grid grid-cols-1 grid-rows-3 items-center h-screen w-full p-10">
      <div className="flex flex-col justify-end row-span-1 items-center">
        <div className="flex flex-col">
          <h1 className="text-6xl font-semibold leading-[.9]">
            Welcome to Aurora Cloud
          </h1>
          <p className="pb-2">
            Begin looking find your files using the search bar below.
          </p>
        </div>
        <div className="w-full px-24">
          <SearchFiles />
        </div>
      </div>
      <div className="grid grid-cols-2 grid-rows-1 row-span-2 h-full w-full">
        <div>
          <div className="text-2xl font-semibold">Recent files</div>
        </div>
        <div className="flex flex-col">
          <div className="text-2xl font-semibold">Analysis</div>
        </div>
      </div>
    </div>
  );
}
