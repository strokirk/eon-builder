import { useState } from "react"

import { DiceInput } from "./DiceInput"
import { Die, addDice, dieFormat } from "./utils"

type Attribute = {
  mods?: Mod[]
  name: string
  value?: number
}

type Mod = {
  action: {
    name: string
    value: Die
  }
}

export function AttributeGroup({ attributes }: { attributes: Attribute[] }) {
  const headerNames = ["Attributnamn", "Summa", "Grundtärningar", "Modifierare"]
  const headers = headerNames.map((n, i) => <th key={i}>{n}</th>)
  const rows = attributes.map((attr) => (
    <AttributeAdderRow
      key={attr.name}
      mods={attr.mods}
      name={attr.name}
      value={attr.value || 0}
    />
  ))
  return (
    <div>
      <table className="table-condensed">
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

export function AttributeAdderRow(props: {
  mods?: Mod[]
  name: string
  value: number
}) {
  const [state, setState] = useState({
    value: {
      dice: props.value || 0,
      mod: 0,
      raw: {
        dice: 1,
        mod: 0,
      },
    },
  })

  let { value } = state
  let diceMods = props.mods || []
  let sum = dieFormat(value)
  if (diceMods.length) {
    let summed: Die = diceMods
      .filter((e) => e.action.value)
      .map((e) => e.action.value)
      .concat(value)
      .reduce(addDice, { dice: 0, mod: 0 })
    sum = dieFormat(summed)
  }
  let diceModsStr = diceMods
    .map((e) => e.action.name + ": " + (dieFormat(e.action.value) || "0T6"))
    .join(", ")

  return (
    <tr>
      <td>{props.name}</td>
      <td>
        <span className="fn-dice">{sum}</span>
      </td>
      <td>
        <DiceInput
          onChange={(evt) => {
            setState({ value: evt })
          }}
          value={value}
        />
      </td>
      <td>{diceModsStr}</td>
    </tr>
  )
}
