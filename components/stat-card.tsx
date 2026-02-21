import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: string
}

export function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <Card className="gap-0 py-5">
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            accent ?? "bg-primary/10"
          )}
        >
          <Icon className={cn("size-5", accent ? "text-card" : "text-primary")} />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
