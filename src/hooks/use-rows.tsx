import { useState } from "react"

import { getID } from "../utils"

type RowData = {
  contents: string
  id: string
  title: string
}

export function useRows(initial?: RowData[]) {
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
