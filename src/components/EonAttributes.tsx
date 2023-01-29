import { useContext, useEffect, useState } from "react"

import { GlobalData } from "../contexts"
import { ATTRIBUTES_SECONDARY } from "../data"
import { useCharEffectsSelector } from "../hooks/use-char-effects-selector"
import { Char, EffectType } from "../types"
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

  let base = { dice: 0, mod: 0 }
  if (ATTRIBUTES_SECONDARY.includes(props.name)) {
    const calc = calculateSecondaryAttributes(props.name, char)
    if (calc) {
      base = calc
    }
  }

  let diceMods: Die[] = useCharEffectsSelector()
    .concat(char.events?.flatMap((e) => e.effects) || [])
    .filter((e) => e.type === EffectType.ATTRIBUTE)
    .filter((e) => e.name === props.name)
    .map((e) => parseDie(e.bonus || "0T6"))

  const mods = diceMods.concat([base, value])
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

function calculateSecondaryAttributes(name: string, char: Char) {
  switch (name) {
    case "Förflyttning":
      return dieMean(char.attributes.Rörlighet, char.attributes.Tålighet)
    case "Intryck":
      return dieMean(char.attributes.Utstrålning, char.attributes.Visdom)
    case "Kroppsbyggnad":
      return dieMean(char.attributes.Styrka, char.attributes.Tålighet)
    case "Reaktion":
      return dieMean(char.attributes.Rörlighet, char.attributes.Uppfattning)
    case "Självkontroll":
      return dieMean(char.attributes.Psyke, char.attributes.Vilja)
    case "Vaksamhet":
      return dieMean(char.attributes.Psyke, char.attributes.Uppfattning)
    case "Livskraft":
      return lifeDie(char)
    case "Grundskada":
      return damageDie(char)
  }
}

function dieMean(a?: string, b?: string): Die | undefined {
  if (!a || !b) {
    return undefined
  }
  const dieA = parseDie(a)
  const dieB = parseDie(b)
  return halfDie(sumDice([dieA, dieB]))
}

function halfDie(a: Die): Die {
  const die = { ...a }
  die.dice = Math.floor(die.dice / 2)
  die.mod = Math.floor(die.mod / 2)
  if (die.dice % 2 === 1) {
    die.mod = die.mod + 2
  }
  return die
}

function damageDie(char: Char): Die {
  const a = char.attributes.Styrka
  const base = { dice: 1, mod: 0 }
  if (!a) {
    return base
  }
  return sumDice([halfDie(parseDie(a)), base])
}

function lifeDie(char: Char): Die {
  const a = char.attributes.Tålighet
  const b = char.attributes.Vilja
  const base = { dice: 3, mod: 0 }
  if (!a || !b) {
    return base
  }
  const dieA = parseDie(a)
  const dieB = parseDie(b)
  const sum = sumDice([dieA, dieB])
  if (sum.dice < 5) {
    return base
  }
  const modified = { dice: 0, mod: sum.dice - 4 }
  return sumDice([modified, base])
}
