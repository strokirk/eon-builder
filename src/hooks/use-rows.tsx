import { useState } from "react"
import { hashValue } from "solid-js/types/reactive/signal"

import { getID } from "../utils"

type RowData<C> = {
  value: C
  id: string
  order: number
}

export function useRows<C>(initial?: C[]) {
  const [rows, setRows] = useState<RowData<C>[]>(
    initial?.map((r) => ({ value: r, id: getID() })) || [newRow()],
  )

  function updateRow(key: string, data: Partial<C>) {
    setRows((r) =>
      r.map((x) =>
        x.id === key ? { ...x, value: { ...x.value, ...data } } : x,
      ),
    )
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
    getValues: () => rows.map((r) => r.value),
  }
}

function newRow(): any {
  return { id: getID(), value: {} }
}
