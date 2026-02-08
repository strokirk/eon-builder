import { Char } from "./types"

export function formatExport(char: Char): string {
  const rows: string[] = []
  console.log(char)
  const kvRows = [
    [`Bakgrund`, char.Bakgrund?.name],
    [`Miljö`, char.environment?.value],
    [`Arketyp`, char.archetype?.value],
    [`Folkslag`, char.tribe?.value],
  ]
  for (const row of kvRows) {
    if (row[1]) {
      rows.push(row.join(": "))
    }
  }
  const events = char.events || []
  if (events.length > 0) {
    rows.push("Händelser:")
    for (const event of events) {
      rows.push(`  ${event.table || ""} ${event.number || ""} - ${event.title || ""}`)
    }
  }
  return rows.join("\n")
}