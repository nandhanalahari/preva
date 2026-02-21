"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { RiskHistoryPoint } from "@/lib/data"
import { formatDate } from "@/lib/data"

const chartConfig = {
  score: {
    label: "Risk Score",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export function RiskTrendChart({ data }: { data: RiskHistoryPoint[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Risk Score Trend
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
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <ReferenceLine y={50} stroke="var(--color-risk-medium)" strokeDasharray="4 4" strokeOpacity={0.5} />
            <ChartTooltip
              content={<ChartTooltipContent labelFormatter={formatDate} />}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-score)"
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
