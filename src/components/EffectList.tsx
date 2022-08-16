import { useState } from "react"
import useUpdateEffect from "react-use/lib/useUpdateEffect"

import { MinusButton } from "../buttons"
import {
  ATTRIBUTES,
  ATTRIBUTES_SECONDARY,
  SKILL_GROUPS,
  TABLE_GROUPS,
} from "../data"
import { EffectType } from "../types"
import { addDice, dieFormat, getID, parseDie } from "../utils"
import { DropdownCombobox } from "./DropdownCombobox"

const types = [
  EffectType.SKILLPOINTS,
  EffectType.TABELLSLAG,
  EffectType.ATTRIBUTE,
  EffectType.ANNAT,
]

export type EffectData = {
  bonus?: string
  id: string
  name?: string
  type: EffectType
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

  function addNewEffect(type: EffectType): void {
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
                  updateRow={(data) => setRowData(row.id, data)}
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
  updateRow,
}: {
  row: EffectData
  removeRow: () => void
  updateRow: (data: Partial<EffectData>) => void
}): JSX.Element {
  const topRow = (
    <div className="flex items-center justify-between">
      <span className="italic text-sm">{row.type}</span>
      <MinusButton onClick={removeRow} />
    </div>
  )
  if (row.type == EffectType.ANNAT) {
    return (
      <>
        {topRow}
        <div className="flex">
          <textarea
            className="w-full border col-span-2"
            value={row.bonus}
            onChange={(e) => {
              updateRow({ bonus: e.currentTarget.value })
            }}
          />
        </div>
      </>
    )
  }

  let choices = getChoices(row)
  const setBonus = (value: any) => updateRow({ bonus: value })
  const isDieInput = row.type == EffectType.ATTRIBUTE
  return (
    <>
      {topRow}
      <div className="flex">
        <input
          className="w-16 mr-4 border"
          onChange={(e) => setBonus(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (isDieInput) {
              if (e.key === "ArrowUp") {
                setBonus(nextDieValue(row.bonus))
                e.preventDefault()
              }
              if (e.key === "ArrowDown") {
                setBonus(prevDieValue(row.bonus))
                e.preventDefault()
              }
            }
          }}
          min={
            row.type === EffectType.TABELLSLAG ||
            row.type === EffectType.SKILLPOINTS
              ? 0
              : undefined
          }
          type={
            row.type === EffectType.TABELLSLAG ||
            row.type === EffectType.SKILLPOINTS
              ? "number"
              : "text"
          }
          value={row.bonus || ""}
        />
        {choices && (
          <DropdownCombobox
            className="mr-4 border"
            items={choices}
            onChange={(e) => updateRow({ name: e })}
            value={row.name}
          />
        )}
      </div>
    </>
  )
}

function getChoices(row: EffectData): null | string[] {
  let choices: null | string[] = null
  if (row.type == EffectType.SKILLPOINTS) {
    choices = SKILL_GROUPS.map((x) => x.name)
  }
  if (row.type == EffectType.TABELLSLAG) {
    choices = TABLE_GROUPS.map((x) => x.name)
  }
  if (row.type == EffectType.ATTRIBUTE) {
    choices = ATTRIBUTES.concat(ATTRIBUTES_SECONDARY)
  }
  return choices
}

function nextDieValue(value?: string) {
  if (!value) {
    return "1T6"
  }
  return dieFormat(addDice(parseDie(value), { dice: 1, mod: 0 }))
}

function prevDieValue(value?: string) {
  if (!value) {
    return ""
  }
  return dieFormat(addDice(parseDie(value), { dice: -1, mod: 0 }))
}
