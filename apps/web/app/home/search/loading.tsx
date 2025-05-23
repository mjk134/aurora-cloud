import SearchFiles from "../../../components/files-search";

export default function Loading() {
  return (
    <div className="flex relative font-sans flex-col p-5 h-screen w-full">
      <h1 className="text-5xl font-bold">Search Files</h1>
      <p className="text-lg">Search for files and folders.</p>
      <SearchFiles disabled />
      <div className="@container flex relative flex-col h-full w-full overflow-hidden">
        <div className="flex gap-2">
          <div className="text-xl font-medium mt-3 pb-4">Loading files...</div>
        </div>
        <div className="grid grid-cols-4 @md:grid-cols-5 @lg:grid-cols-6 grid-rows-auto gap-4 overflow-scroll pb-32">
          {Array.from({ length: 18 }).map((_, index) => (
            <div key={index} className="p-4">
              <div className="animate-pulse h-[240px] w-[240px] rounded bg-gray-100"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
