import { useContext, useEffect } from "react"

import { GlobalData } from "../contexts"
import { useRows } from "./use-rows"

export function useCharValueList<C>(options: { field: string }) {
  const [char, setChar] = useContext(GlobalData)
  const { addRow, getValues, removeRow, updateRow, rows } = useRows<C>(char[options.field] || [{}])
  useEffect(() => setChar({ events: getValues() }), [rows])

  return { addRow, getValues, removeRow, updateRow, rows }
}