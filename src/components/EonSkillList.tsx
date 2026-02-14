import { useContext, useEffect, useState } from "react"

import { MinusButton, PlusButton } from "../buttons"
import { GlobalData } from "../contexts"
import { useCharEffectsSelector } from "../hooks/use-char-effects-selector"
import { useRows } from "../hooks/use-rows"
import { Effect, EffectType } from "../types"

export function EonSkillList() {
  const [char, setChar] = useContext(GlobalData)
  const effects = useCharEffectsSelector()
    .concat(char.events?.flatMap((e) => e.effects) || [])
    .filter((x) => x?.type === EffectType.SKILLPOINTS)
  const sums = getEffectSums(effects)

  let { addRow, removeRow, rows, updateRow, getValues } = useRows<{
    title: string
    contents: string
  }>(char.skills || [{}])

  useEffect(() => setChar({ skills: getValues() }), [rows])

  return (
    <div className="space-y-2">
      <ul>
        {sums.map(({ bonus, name }) => (
          <li key={name}>
            {bonus} - {name}
          </li>
        ))}
      </ul>
      <ul className="space-y-2 mb-2">
        {rows.map((row) => (
          <li className="flex items-center" key={row.id}>
            <input
              className="w-16 uppercase mr-2"
              placeholder="1T6"
              onChange={(e) => updateRow(row.id, { contents: e.currentTarget.value })}
              type="text"
              value={row.value.contents || ""}
            />
            <input
              className=""
              placeholder="Färdighet"
              onChange={(e) => updateRow(row.id, { title: e.currentTarget.value })}
              type="text"
              value={row.value.title || ""}
            />
            <MinusButton onClick={() => removeRow(row.id)} />
          </li>
        ))}
      </ul>

      <PlusButton onClick={addRow} />
    </div>
  )
}

function getEffectSums(effects: Effect[]): { name: string; bonus: number }[] {
  const sums: Record<string, number> = {}
  for (const effect of effects) {
    const bonus = +(effect.bonus || 0)
    let name = effect.name || ""
    if (effect.name && Number.isInteger(bonus)) {
      sums[name] = (sums[name] || 0) + bonus
    }
  }
  return Object.entries(sums)
    .map(([name, bonus]) => ({ bonus, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}