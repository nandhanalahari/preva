import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Medication } from "@/lib/data"
import { formatDate } from "@/lib/data"

function getAdherenceColor(percent: number): string {
  if (percent >= 90) return "text-risk-low"
  if (percent >= 75) return "text-risk-medium"
  return "text-risk-high"
}

function getProgressStyle(percent: number): string {
  if (percent >= 90) return "[&_[data-slot=progress-indicator]]:bg-risk-low"
  if (percent >= 75) return "[&_[data-slot=progress-indicator]]:bg-risk-medium"
  return "[&_[data-slot=progress-indicator]]:bg-risk-high"
}

export function MedicationList({ medications }: { medications: Medication[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Medication Adherence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead className="hidden sm:table-cell">Frequency</TableHead>
              <TableHead>Adherence</TableHead>
              <TableHead className="hidden md:table-cell">Last Taken</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((med) => (
              <TableRow key={med.name}>
                <TableCell className="font-medium text-foreground">{med.name}</TableCell>
                <TableCell className="text-muted-foreground">{med.dosage}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{med.frequency}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={med.adherencePercent}
                      className={`h-2 w-16 ${getProgressStyle(med.adherencePercent)}`}
                    />
                    <span className={`text-xs font-medium ${getAdherenceColor(med.adherencePercent)}`}>
                      {med.adherencePercent}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {formatDate(med.lastTaken)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
