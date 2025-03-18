import PieChartChunks from "../../../components/analysis/pie-chart";

export default function Analysis() {
  return (
    <div className="flex relative font-sans flex-col p-5 h-screen w-full">
      <h1 className="text-4xl font-bold">Analysis</h1>
      <p className="text-lg">
        View how your files are being stored and other specifics.
      </p>
      <div className="grid grid-cols-2 grid-rows-auto relative flex-col h-full w-full overflow-hidden">
        <div className="flex flex-col justify-center items-center">
          <div className="text-xl font-medium mt-3 pb-4">File storage</div>
          <PieChartChunks telegramChunkLength={10} discordChunkLength={20} />
        </div>
      </div>
    </div>
  );
}
