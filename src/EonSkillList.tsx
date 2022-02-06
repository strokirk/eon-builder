import { useContext, useEffect, useState } from "react"

import { MinusButton, PlusButton } from "./buttons"
import { GlobalData } from "./contexts"
import { getID } from "./utils"

export function EonSkillList() {
  const [char, setChar] = useContext(GlobalData)
  let { addRow, removeRow, rows, updateRow } = useRows(char.skills)

  useEffect(() => {
    setChar({ skills: rows.map(({ id: _id, ...r }) => r) })
  }, [rows])

  return (
    <>
      <ul className="space-y-2 mb-2">
        {rows.map((row) => (
          <li className="flex items-center" key={row.id}>
            <input
              className="w-16 uppercase mr-2"
              onChange={(e) =>
                updateRow(row.id, { value: e.currentTarget.value })
              }
              type="text"
              value={row.value}
            />
            <input
              className=""
              onChange={(e) =>
                updateRow(row.id, { name: e.currentTarget.value })
              }
              type="text"
              value={row.name}
            />
            <MinusButton onClick={() => removeRow(row.id)} />
          </li>
        ))}
      </ul>

      <PlusButton onClick={addRow} />
    </>
  )
}

type RowData = {
  id: string
  name: string
  value: string
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
  return { id: getID(), name: "", value: "" }
}
