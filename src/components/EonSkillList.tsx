import { useContext, useEffect, useState } from "react"

import { MinusButton, PlusButton } from "../buttons"
import { GlobalData } from "../contexts"
import { useRows } from "../hooks/use-rows"

export function dropKey(obj: any, key: string) {
  let { [key]: _, ...rest } = obj
  return rest
}

export function EonSkillList() {
  const [char, setChar] = useContext(GlobalData)
  let { addRow, removeRow, rows, updateRow } = useRows(char.skills)

  useEffect(() => {
    setChar({ skills: rows.map((r) => dropKey(r, "id")) })
  }, [rows])

  return (
    <>
      <ul className="space-y-2 mb-2">
        {rows.map((row) => (
          <li className="flex items-center" key={row.id}>
            <input
              className="w-16 uppercase mr-2"
              placeholder="1T6"
              onChange={(e) =>
                updateRow(row.id, { contents: e.currentTarget.value })
              }
              type="text"
              value={row.contents}
            />
            <input
              className=""
              placeholder="Färdighet"
              onChange={(e) =>
                updateRow(row.id, { title: e.currentTarget.value })
              }
              type="text"
              value={row.title}
            />
            <MinusButton onClick={() => removeRow(row.id)} />
          </li>
        ))}
      </ul>

      <PlusButton onClick={addRow} />
    </>
  )
}
