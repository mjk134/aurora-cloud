import SearchFiles from "../../../../components/files-search";

export default function Loading() {
  return (
    <div className="flex relative font-sans flex-col p-5 h-screen w-full">
      <h1 className="text-4xl font-bold">All Files</h1>
      <p className="text-lg">
        The best place to upload and manage your files. Drag files in to begin
        uploading. Right-click files to manage them.
      </p>
      <SearchFiles disabled />
      <div className="@container flex relative flex-col h-full w-full overflow-hidden">
        <div className="flex gap-2">{/* TODO: Prevent re-render */}
          <div className="text-xl font-medium mt-3 pb-4">
            Loading files...
          </div>
        </div>
        <div className="grid grid-cols-4 @md:grid-cols-5 @lg:grid-cols-6 grid-rows-auto gap-4 overflow-scroll pb-32">
          {Array.from({ length: 18 }).map((_, index) => (
            <div className="p-4">
              <div className="animate-pulse h-[240px] w-[240px] rounded bg-gray-100"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
