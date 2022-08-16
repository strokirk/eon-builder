import { useContext, useEffect, useState } from "react"

import { GlobalData } from "../contexts"
import { ATTRIBUTES_SECONDARY } from "../data"
import { useCharEffectsSelector } from "../hooks/use-char-effects-selector"
import { EffectType } from "../types"
import { Die, dieFormat, parseDie, sumDice } from "../utils"
import { DiceInput } from "./DiceInput"

export function AttributeGroup({ attributes }: { attributes: string[] }) {
  const headerNames = ["Attributnamn", "Summa", "Grundtärningar", "Modifierare"]
  const headers = headerNames.map((n, i) => <th key={i}>{n}</th>)
  const rows = attributes.map((attr) => (
    <AttributeAdderRow key={attr} name={attr} />
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

export function SecondaryAttributeGroup() {
  return (
    <>
      <AttributeGroup attributes={ATTRIBUTES_SECONDARY} />
    </>
  )
}

export function AttributeAdderRow(props: { name: string }) {
  const [char, setChar] = useContext(GlobalData)

  const [value, setValue] = useState<Die>(
    char.attributePoints?.[props.name] || { dice: 0, mod: 0 },
  )

  let diceMods: Die[] = useCharEffectsSelector()
    .filter((e) => e.type === EffectType.ATTRIBUTE)
    .filter((e) => e.name === props.name)
    .map((e) => parseDie(e.bonus || "0T6"))

  const mods = diceMods.concat([value])
  let sum = dieFormat(sumDice(mods))
  let diceModsStr = diceMods
    .map((e) => dieFormat(e))
    .map((e) => "+" + e)
    .join(", ")

  useEffect(() => {
    setChar({ attributes: { ...char.attributes, [props.name]: sum } })
  }, [sum])

  useEffect(() => {
    setChar({
      attributePoints: { ...char.attributePoints, [props.name]: value },
    })
  }, [value])

  return (
    <tr>
      <td>{props.name}</td>
      <td>
        <span className="fn-dice">{sum}</span>
      </td>
      <td>
        <DiceInput onChange={(evt) => setValue(() => evt)} value={value} />
      </td>
      <td>{diceModsStr}</td>
    </tr>
  )
}
