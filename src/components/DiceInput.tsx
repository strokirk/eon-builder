import { useEffect, useState } from "react"

type Die = { dice: number; mod: number }

export function DiceInput(props: {
  idPrefix?: string
  namePrefix?: string
  value: { dice: number; mod: number }
  onChange?: (e: Die) => void
}) {
  const [dice, setDice] = useState(props.value.dice)
  const [mod, setMod] = useState(props.value.mod)
  const basePrefix = (props.idPrefix || props.namePrefix || "dice-input")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "")
  const diceId = `${basePrefix}-dice`
  const modId = `${basePrefix}-mod`
  const diceName = `${props.namePrefix || basePrefix}-dice`
  const modName = `${props.namePrefix || basePrefix}-mod`

  function onChange() {
    if (props.onChange) {
      let d = Math.floor(dice || 0)
      let m = Math.floor(mod || 0)
      while (m >= 4) {
        d += 1
        m -= 4
      }
      while (m <= -3) {
        d -= 1
        m += 3
      }
      props.onChange({
        dice: d,
        mod: m,
      })
    }
  }

  useEffect(onChange, [dice, mod])

  return (
    <div className="dice">
      <label className="sr-only" htmlFor={diceId}>
        Tärningar
      </label>
      <input
        id={diceId}
        name={diceName}
        className="input-base input-compact"
        onChange={(evt) => {
          setDice(parseInt(evt.target.value, 10))
        }}
        title="Tärningar"
        type="number"
        value={dice}
      />
      T6+
      <label className="sr-only" htmlFor={modId}>
        Bonus
      </label>
      <input
        id={modId}
        name={modName}
        className="input-base input-compact"
        onChange={(evt) => {
          setMod(parseInt(evt.target.value, 10))
        }}
        title="Bonus"
        type="number"
        value={mod}
      />
    </div>
  )
}