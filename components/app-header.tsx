import Link from "next/link"
import { Activity } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Preva
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Sarah Mitchell, RN</p>
            <p className="text-xs text-muted-foreground">Home Health Nurse</p>
          </div>
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              SM
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
