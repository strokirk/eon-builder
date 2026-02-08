import { useEffect, useState } from "react"

type Die = { dice: number; mod: number }

export function DiceInput(props: {
  value: { dice: number; mod: number }
  onChange?: (e: Die) => void
}) {
  const [dice, setDice] = useState(props.value.dice)
  const [mod, setMod] = useState(props.value.mod)

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
      <input
        onChange={(evt) => {
          setDice(parseInt(evt.target.value, 10))
        }}
        title="Tärningar"
        type="number"
        value={dice}
      />
      T6+
      <input
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