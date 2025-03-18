"use client";

import { ResponsiveContainer, PieChart, Pie } from "recharts";

export default function PieChartChunks({
  telegramChunkLength,
  discordChunkLength,
}: {
  telegramChunkLength: number;
  discordChunkLength: number;
}) {
  const data = [
    { name: "Telegram", value: telegramChunkLength * 2 }, // Telegram file is about 20 whereas Discord is about 10
    { name: "Discord", value: discordChunkLength },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart width={400} height={400}>
        <Pie
          dataKey="value"
          data={data}
          nameKey={"name"}
          startAngle={90}
          endAngle={-270}
          cx="50%"
          cy="50%"
          outerRadius={110}
          fill="#8884d8"
          name="File storage"
          label
          labelLine={false}
          animationEasing="ease-in-out"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
