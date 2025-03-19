"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import { FolderFileTree } from "../../types";

export default function FolderTreeMap({ data }: { data: FolderFileTree }) {
  console.log(data);
  return (
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        width={1000}
        height={250}
        data={data.children}
        nameKey={"name"}
        dataKey="size"
        stroke="#fff"
        fill="#0893b1"
      >
        <Tooltip />
      </Treemap>
    </ResponsiveContainer>
  );
}
