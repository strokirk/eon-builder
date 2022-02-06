import { useContext, useEffect, useState } from "react"
import { DropdownCombobox } from "./DropdownCombobox"
import { MinusButton, PlusButton } from "./buttons"
import { GlobalData } from "./contexts"
import { TABLE_GROUPS } from "./data"
import { Char } from "./types"
import { getID } from "./utils"

export function EonEvents() {
  const [char] = useContext(GlobalData)
  const sums = getTableRollSums(char)
  return (
    <div>
      <ul>
        {Object.entries(sums).map(([name, bonus]) => (
          <li key={name}>
            {bonus} - {name}
          </li>
        ))}
      </ul>
      <EventList />
    </div>
  )
}

function getTableRollSums(char: Char): { [key: string]: number } {
  let effects: any[] = []
  // [char.Bakgrund, char.archetype, char.environment, char.tribe]
  //   .flatMap((x) => x?.effects?.Tabellslag || [])
  //   .filter(Boolean)
  effects = effects.sort((a, b) => a?.name?.localeCompare(b.name))

  const sums: Record<string, number> = {}
  for (const effect of effects) {
    const bonus = +effect.bonus
    if (Number.isInteger(bonus)) {
      sums[effect.name] = (sums[effect.name] || 0) + bonus
    }
  }
  return sums
}

function EventList() {
  const [char, setChar] = useContext(GlobalData)

  type Data = {
    [k: string]: string
    id: string
  }

  let [rows, setRows] = useState<Data[]>(
    char.events?.map((r) => ({ ...r, id: getID() })) || [{ id: getID() }],
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

  useEffect(() => {
    setChar({ events: rows.map(({ id: _id, ...r }) => r) })
  }, [rows])

  return (
    <div>
      <div>Summary:</div>
      <ul className="my-2 space-y-2">
        {rows.map((row, i) => {
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
