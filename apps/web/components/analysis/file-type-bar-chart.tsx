"use client";

import mimedb from "mime-db"; // A list of all mime types and their extensions
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function FileTypeBarChart({
  fileTypes,
}: {
  fileTypes: {
    type: string;
    count: number;
  }[];
}) {
  const data = fileTypes
    .map((fileType) => {
      return {
        name: mimedb[fileType.type]?.extensions?.[0] ?? fileType.type,
        value: fileType.count,
        // Generate a random color using 256 ^ 3
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      };
    })
    .sort((a, b) => b.value - a.value); // Order by value descending

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart width={300} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="value" fill="#0e7dbd" />
        <XAxis
          dataKey="name"
        />
        <YAxis
          label={{ value: "File count", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
      </BarChart>
    </ResponsiveContainer>
  );
}
