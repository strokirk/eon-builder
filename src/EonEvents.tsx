import { useContext, useEffect, useState } from "react"

import { DropdownCombobox } from "./DropdownCombobox"
import { MinusButton, PlusButton } from "./buttons"
import { GlobalData } from "./contexts"
import { TABLE_GROUPS } from "./data"
import { Char, TABELLSLAG } from "./types"
import { getID } from "./utils"

export function EonEvents() {
  const [char] = useContext(GlobalData)
  const sums = getTableRollSums(char)
  return (
    <div>
      <ul>
        {sums.map(({ bonus, name }) => (
          <li key={name}>
            {bonus} - {name}
          </li>
        ))}
      </ul>
      <EventList />
    </div>
  )
}

function getTableRollSums(char: Char): { name: string; bonus: number }[] {
  const lists = [
    //
    char.Bakgrund,
    char.archetype,
    char.environment,
    char.tribe,
  ]
  let effects = lists
    .flatMap((x) => x?.effects || [])
    .filter((x) => x.type === TABELLSLAG)

  const sums: Record<string, number> = {}
  for (const effect of effects) {
    const bonus = +(effect.bonus || 0)
    let name = effect.name || ""
    if (name != "" && Number.isInteger(bonus)) {
      sums[name] = (sums[name] || 0) + bonus
    }
  }
  return Object.entries(sums)
    .map(([name, bonus]) => ({ bonus, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function EventList() {
  const [char, setChar] = useContext(GlobalData)

  const { addRow, getRowsWithoutID, removeRow, rows, setRowData } = useRows(
    char.events || [{}],
  )
  useEffect(() => {
    setChar({ events: getRowsWithoutID() })
  }, [rows])

  return (
    <div>
      <ul className="my-2 space-y-2">
        {rows.map((row) => {
          return (
            <li className="flex flex-col max-w-md" key={row.id}>
              <div className="flex gap-2 mb-2">
                <DropdownCombobox
                  className="mr-4 border"
                  items={TABLE_GROUPS.map((group) => group.name)}
                  onChange={(e) => setRowData(row.id, { id: row.id, table: e })}
                  placeholder="Tabell"
                  value={row.table}
                />
                <input
                  className="w-16"
                  onChange={(e) =>
                    setRowData(row.id, { number: e.currentTarget.value })
                  }
                  placeholder="T100"
                  type="text"
                  value={row.number}
                />
                <input
                  onChange={(e) =>
                    setRowData(row.id, { title: e.currentTarget.value })
                  }
                  placeholder="Händelse"
                  type="text"
                  value={row.title}
                />
                <MinusButton onClick={() => removeRow(row.id)} />
              </div>

              <textarea
                onChange={(e) =>
                  setRowData(row.id, { content: e.currentTarget.value })
                }
                placeholder="Beskrivning"
                value={row.content}
              />
            </li>
          )
        })}
      </ul>
      <PlusButton onClick={addRow} />
    </div>
  )
}

type RowData = {
  [k: string]: string
  id: string
}
function useRows(initialRows: Record<string, string>[]) {
  let [rows, setRows] = useState<RowData[]>(
    initialRows.map((r) => ({ ...r, id: getID() })) || [{ id: getID() }],
  )

  function setRowData(key: string, data: any) {
    setRows((r) => r.map((x) => (x.id === key ? { ...x, ...data } : x)))
  }

  function removeRow(key: string) {
    setRows((rows) => rows.filter((x) => x.id !== key))
  }

  function addRow() {
    setRows((r) => r.concat({ id: getID() }))
  }

  return {
    addRow,
    removeRow,
    rows,
    setRowData,
    getRowsWithoutID: () => rows.map(({ id: _id, ...r }) => r),
  }
}
