import { useContext, useEffect, useState } from "react"

import { MinusButton, PlusButton } from "./buttons"
import { GlobalData } from "./contexts"
import { getID } from "./utils"

type RowData = {
  contents: string
  id: string
  title: string
}
function useRows(initial?: RowData[]) {
  const [rows, setRows] = useState<RowData[]>(
    initial?.map((r) => ({ ...r, id: getID() })) || [newRow()],
  )

  function updateRow(key: string, data: Partial<RowData>) {
    setRows((r) => r.map((x) => (x.id === key ? { ...x, ...data } : x)))
  }

  function removeRow(key: string) {
    setRows((rows) => rows.filter((x) => x.id !== key))
  }

  function addRow() {
    setRows((r) => r.concat(newRow()))
  }

  return {
    addRow,
    removeRow,
    rows,
    updateRow,
  }
}

function newRow(): any {
  return { contents: "", id: getID(), title: "" }
}

export function EonNotes() {
  const [char, setChar] = useContext(GlobalData)

  let { addRow, removeRow, rows, updateRow } = useRows(char.possessions)

  useEffect(() => {
    setChar({ notes: rows.map(({ id: _id, ...r }) => r) })
  }, [rows])

  return (
    <>
      <ul className="space-y-2">
        {rows.map((row) => {
          return (
            <li className="max-w-prose" key={row.id}>
              <div className="flex items-center mb-2">
                <input
                  className="w-full mr-4"
                  onChange={(e) => {
                    updateRow(row.id, { title: e.currentTarget.value })
                  }}
                  type="text"
                  value={row.title}
                />
                <MinusButton onClick={() => removeRow(row.id)} />
              </div>
              <textarea
                className="w-full"
                onChange={(e) => {
                  updateRow(row.id, { contents: e.currentTarget.value })
                }}
                value={row.contents}
              ></textarea>
            </li>
          )
        })}
      </ul>

      <PlusButton onClick={addRow} />
    </>
  )
}
