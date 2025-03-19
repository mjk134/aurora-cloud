export default function Loading() {
  return (
    <div className="flex relative font-sans flex-col p-5 h-screen w-full">
      <h1 className="text-5xl font-bold">Analysis</h1>
      <p className="text-lg">
        View how your files are being stored and other specifics.
      </p>
      <div className="grid grid-cols-2 gap-4 grid-rows-auto relative flex-col h-full w-full overflow-scroll">
        <div className="flex flex-col justify-center items-center">
          <div className="text-xl font-medium mt-3 pb-4">
            File storage spread (%)
          </div>
          <div className="animate-pulse h-full w-full rounded bg-gray-100"></div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="text-xl font-medium mt-3 pb-4">File types</div>
          <div className="animate-pulse h-full w-full rounded bg-gray-100"></div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="text-xl font-medium mt-3 pb-4">
            File Sizes (top 10)
          </div>
          <div className="animate-pulse h-full w-full rounded bg-gray-100"></div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="text-xl font-medium mt-3 pb-4">Tree Map</div>
          <div className="animate-pulse h-full w-full rounded bg-gray-100"></div>
        </div>
      </div>
    </div>
  );
}
