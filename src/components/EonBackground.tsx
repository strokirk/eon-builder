import { useContext, useEffect, useState } from "react"

import { GlobalData } from "../contexts"
import { EffectData, EffectList } from "./EffectList"

export function EonBackground() {
  const [char, setChar] = useContext(GlobalData)
  const [number, setNumber] = useState(char?.Bakgrund?.number)
  const [name, setName] = useState(char?.Bakgrund?.name)
  const [effects, setEffects] = useState(
    (char?.Bakgrund?.effects || []) as EffectData[],
  )
  useEffect(() => {
    setChar({ Bakgrund: { effects, name, number } })
  }, [number, name, effects])
  return (
    <div>
      <div className="mb-2 space-x-2 ">
        <input
          className="w-16 placeholder:italic"
          onChange={(e) => setNumber(e.currentTarget.value)}
          placeholder="00"
          type="text"
          value={number}
        />
        <input
          onChange={(e) => setName(e.currentTarget.value)}
          type="text"
          value={name}
        ></input>
      </div>
      <EffectList
        effects={effects}
        onChange={(e) => {
          setEffects(e)
        }}
      />
    </div>
  )
}
