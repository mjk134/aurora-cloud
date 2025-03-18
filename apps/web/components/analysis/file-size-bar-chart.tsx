"use client";

import mimedb from "mime-db";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function FileSizeBarChart({
  fileSizes,
}: {
  fileSizes: {
    file_name: string;
    file_size: bigint;
  }[];
}) {

  const data = fileSizes.map((fileSize) => {
    return {
      name: fileSize.file_name,
      value: parseInt(String(fileSize.file_size)),
      // Generate a random color using 256 ^ 3
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart width={300} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="value" fill="#12bea1" />
        <XAxis
          dataKey="name"
          // label={{ value: "File types", postion: "insideBottom", offset: 0 }}
        />
        <YAxis
          label={{ value: "File size", angle: -90, position: "insideLeft" }}
          tickFormatter={(value) =>
            new Intl.NumberFormat("en-US", {
              notation: "compact",
              compactDisplay: "short",
            }).format(value) + 'B'
          }
        />
        <Tooltip />
      </BarChart>
    </ResponsiveContainer>
  );
}
