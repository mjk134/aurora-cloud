"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
  Legend,
  Tooltip,
} from "recharts";

export default function PieChartChunks({
  telegramChunkLength,
  discordChunkLength,
}: {
  telegramChunkLength: number;
  discordChunkLength: number;
}) {
  const data = [
    {
      name: "Telegram",
      value: parseFloat(
        (
          ((telegramChunkLength * 2) /
            (telegramChunkLength * 2 + discordChunkLength)) *
          100
        ).toFixed(2),
      ),
      color: "#23a0dd",
    }, // Telegram file is about 20 whereas Discord is about 10
    {
      name: "Discord",
      value: parseFloat(
        (
          (discordChunkLength /
            (telegramChunkLength * 2 + discordChunkLength)) *
          100
        ).toFixed(2),
      ),
      color: "#5662f6",
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart width={400} height={400}>
        <Pie
          dataKey={"value"}
          nameKey={"name"}
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={110}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}
