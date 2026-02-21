"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { BPHistoryPoint } from "@/lib/data"
import { formatDate } from "@/lib/data"

const chartConfig = {
  systolic: {
    label: "Systolic",
    color: "var(--color-chart-1)",
  },
  diastolic: {
    label: "Diastolic",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig

export function BPTrendChart({ data }: { data: BPHistoryPoint[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Blood Pressure Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="equidistantPreserveStart"
            />
            <YAxis
              domain={[60, 170]}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <ChartTooltip
              content={<ChartTooltipContent labelFormatter={formatDate} />}
            />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="var(--color-systolic)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="var(--color-diastolic)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
