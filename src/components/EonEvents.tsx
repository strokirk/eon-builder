import { MinusButton, PlusButton } from "../buttons"
import { TABLE_GROUPS } from "../data"
import { useCharEffectsSelector } from "../hooks/use-char-effects-selector"
import { useCharValueList } from "../hooks/use-char-value-list"
import { Effect, EffectType } from "../types"
import { DropdownCombobox } from "./DropdownCombobox"

export function EonEvents() {
  const effects = useCharEffectsSelector().filter(
    (x) => x.type === EffectType.TABELLSLAG,
  )
  const sums = getTableRollSums(effects)
  return (
    <div>
      <ul>
        {sums.map(({ bonus, name }) => (
          <li key={name}>
            {bonus} - {name}
          </li>
        ))}
      </ul>
      <EventList />
    </div>
  )
}

function getTableRollSums(
  effects: Effect[],
): { name: string; bonus: number }[] {
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

function EventList() {
  const { addRow, removeRow, rows, updateRow } = useCharValueList<EonEvent>({
    field: "events",
  })

  return (
    <div>
      <ul className="my-2 space-y-2">
        {rows.map((row) => {
          return (
            <EventListItem
              key={row.id}
              updateRow={(d) => updateRow(row.id, d)}
              removeRow={() => removeRow(row.id)}
              event={row.value}
            />
          )
        })}
      </ul>
      <PlusButton onClick={addRow} />
    </div>
  )
}

type EonEvent = {
  table: string
  number: string
  title: string
  content: string
}

function EventListItem(props: {
  removeRow: () => void
  updateRow: (arg0: Partial<EonEvent>) => void
  event: EonEvent
}) {
  const event = props.event
  return (
    <li className="flex flex-col max-w-md">
      <div className="flex gap-2 mb-2">
        <DropdownCombobox
          placeholder="Tabell"
          className="mr-4 border"
          items={TABLE_GROUPS.map((group) => group.name)}
          onChange={(e) => props.updateRow({ table: e })}
          value={event.table || ""}
        />
        <input
          type="text"
          placeholder="T100"
          className="w-16"
          onChange={(e) => props.updateRow({ number: e.currentTarget.value })}
          value={event.number || ""}
        />
        <input
          type="text"
          placeholder="Händelse"
          onChange={(e) => props.updateRow({ title: e.currentTarget.value })}
          value={event.title || ""}
        />
        <MinusButton onClick={() => props.removeRow()} />
      </div>

      <textarea
        onChange={(e) => props.updateRow({ content: e.currentTarget.value })}
        placeholder="Beskrivning"
        value={event.content}
      />
    </li>
  )
}
