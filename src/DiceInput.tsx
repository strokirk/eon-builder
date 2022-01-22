import { useState } from "react"

export function DiceInput(props: {
  value: { dice: number; mod: number }
  onChange: (e: any) => void
}) {
  const [state, setState] = useState<{ d: null | number; m: null | number }>({
    d: props.value?.dice || null,
    m: null,
  })

  function onChange() {
    if (props.onChange) {
      let rd, d, m, rm
      rd = d = Math.floor(state.d || 0)
      rm = m = Math.floor(state.m || 0)
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
        raw: {
          dice: rd,
          mod: rm,
        },
      })
    }
  }
  return (
    <div className="dice">
      <input
        onChange={(evt) => {
          setState((s) => ({ ...s, d: parseInt(evt.currentTarget?.value) }))
          onChange()
        }}
        title="Tärningar"
        type="number"
        value={state.d || ""}
      />
      T6+
      <input
        onChange={(evt) => {
          setState((s) => ({ ...s, m: parseInt(evt.currentTarget?.value) }))
          onChange()
        }}
        title="Bonus"
        type="number"
        value={state.m || ""}
      />
    </div>
  )
}
