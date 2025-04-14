import PieChartChunks from "../../../components/analysis/pie-chart";
import { getUserFromSession } from "../../../lib/session";
import database from "../../../lib/database";
import FileTypeBarChart from "../../../components/analysis/file-type-bar-chart";
import FileSizeBarChart from "../../../components/analysis/file-size-bar-chart";
import { getTreeMapData } from "../../../lib/folder";
import FolderTreeMap from "../../../components/analysis/tree-map";

export default async function Analysis() {
  const user = await getUserFromSession();

  if (!user) return;

  // Count pie charts
  const telegramFileCount = await database.telegramStorage.count({
    where: { user_id: user.user_id },
  });
  const discordFileCount = await database.discordStorage.count({
    where: { user_id: user.user_id },
  });

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
      const typeItem = types[index];
      if (typeItem) {
        if (typeItem.count) {
          typeItem.count += 1;
        }
      }
    }
  });

  const fileSizes = await database.file.findMany({
    where: { user_id: user.user_id },
    select: { file_size: true, file_name: true },
    orderBy: { file_size: "desc" },
    take: 8,
  });

  const treeData = await getTreeMapData(user.user_id);

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
          <PieChartChunks
            telegramChunkLength={telegramFileCount}
            discordChunkLength={discordFileCount}
          />
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="text-xl font-medium mt-3 pb-4">File types</div>
          <FileTypeBarChart fileTypes={types.splice(0, 8)} />
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="text-xl font-medium mt-3 pb-4">
            File Sizes (top 10)
          </div>
          <FileSizeBarChart fileSizes={fileSizes} />
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="text-xl font-medium mt-3 pb-4">Tree Map</div>
          <FolderTreeMap data={treeData} />
        </div>
      </div>
    </div>
  );
}
