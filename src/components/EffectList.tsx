import { useState } from "react"
import useUpdateEffect from "react-use/lib/useUpdateEffect"

import { MinusButton } from "../buttons"
import {
  ATTRIBUTES,
  ATTRIBUTES_SECONDARY,
  SKILL_GROUPS,
  TABLE_GROUPS,
} from "../data"
import { ATTRIBUTE, SKILLPOINTS, TABELLSLAG } from "../types"
import { getID } from "../utils"
import { DropdownCombobox } from "./DropdownCombobox"

const types = [
  //
  SKILLPOINTS,
  TABELLSLAG,
  ATTRIBUTE,
  "Annat",
]

export type EffectData = {
  bonus?: string
  id: string
  name?: string
  type: string
}

export function EffectList({
  effects,
  onChange,
}: {
  effects?: EffectData[]
  onChange?: (e: EffectData[]) => void
}) {
  const [rows, setRows] = useState<EffectData[]>(
    effects?.map((e) => ({ ...e, id: getID() })) || [],
  )
  useUpdateEffect(() => {
    onChange?.(rows)
  }, [rows])

  function addNewEffect(type: string): void {
    const newRows = [...rows, { id: getID(), type }]
    setRows(newRows)
  }

  function setRowData(key: string, data: Partial<EffectData>) {
    setRows((r) => r.map((x) => (x.id === key ? { ...x, ...data } : x)))
  }

  function removeRow(row: EffectData): void {
    return setRows((rows) => rows.filter((x) => x.id !== row.id))
  }

  return (
    <div>
      <span>Lägg till effekter:</span>
      <div className="w-72 mt-1">
        <div className="button-group mb-2">
          {types.map((type) => (
            <button
              className=""
              key={type}
              onClick={() => {
                addNewEffect(type)
              }}
            >
              {type}
            </button>
          ))}
        </div>
        <ul>
          {rows.map((row) => {
            return (
              <li className="" key={row.id}>
                <EffectListItem
                  removeRow={() => removeRow(row)}
                  row={row}
                  setRowData={setRowData}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function EffectListItem({
  removeRow,
  row,
  setRowData,
}: {
  row: EffectData
  removeRow: () => void
  setRowData: (key: string, data: Partial<EffectData>) => void
}): JSX.Element {
  let choices: null | string[] = null
  if (row.type == "Färdighetsenheter") {
    choices = SKILL_GROUPS.map((x) => x.name)
  }
  if (row.type == TABELLSLAG) {
    choices = TABLE_GROUPS.map((x) => x.name)
  }
  if (row.type == "Attribut") {
    choices = ATTRIBUTES.concat(ATTRIBUTES_SECONDARY)
  }
  const topRow = (
    <div className="flex items-center justify-between">
      <span className="italic text-sm">{row.type}</span>
      <MinusButton onClick={removeRow} />
    </div>
  )
  if (row.type == "Annat") {
    return (
      <>
        {topRow}
        <div className="flex">
          <textarea className="w-full border col-span-2" />
        </div>
      </>
    )
  }
  return (
    <>
      {topRow}
      <div className="flex">
        <input
          className="w-16 mr-4 border"
          onChange={(e) => setRowData(row.id, { bonus: e.currentTarget.value })}
          type="text"
          value={row.bonus || ""}
        />
        {choices && (
          <DropdownCombobox
            className="mr-4 border"
            items={choices}
            onChange={(e) => setRowData(row.id, { name: e })}
            value={row.name}
          />
        )}
      </div>
    </>
  )
}
