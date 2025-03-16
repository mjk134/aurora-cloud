export default function Analysis() {
    return (
        <div className="flex relative font-sans flex-col p-5 h-screen w-full">
        <h1 className="text-4xl font-bold">Analysis</h1>
        <p className="text-lg">
          View how your files are being stored and other specifics.
        </p>
        <div className="@container flex relative flex-col h-full w-full overflow-hidden">
          <div className="flex gap-2">
            {/* TODO: Prevent re-render */}

          </div>
        </div>
      </div>
    )
}