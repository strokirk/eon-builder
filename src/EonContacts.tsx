import { useContext, useEffect } from "react"
import { MinusButton, PlusButton } from "./buttons"
import { GlobalData } from "./contexts"
import { useRows } from "./hooks/use-rows"

export function EonContacts() {
  const [char, setChar] = useContext(GlobalData)

  let { addRow, removeRow, rows, updateRow } = useRows(char.possessions)

  useEffect(() => {
    setChar({ contacts: rows.map(({ id: _id, ...r }) => r) })
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
