import { useContext, useState } from "react"
import useUpdateEffect from "react-use/lib/useUpdateEffect"
import { DropdownCombobox } from "./DropdownCombobox"
import { EffectData, EffectList } from "./EffectList"
import { GlobalData } from "./contexts"
import { ARCHETYPES, ENVIRONMENT, TRIBES } from "./data"
import { Char } from "./types"
import { joinArray } from "./utils"

type Types = "archetype" | "environment" | "tribe"

export function EonChoice({ type }: { type: Types }) {
  const [char, setChar] = useContext(GlobalData)
  let initialValue = char[type]?.value
  let initialEffects = (char[type]?.effects || []) as EffectData[]
  if (!Array.isArray(initialEffects)) {
    console.warn(initialEffects)
    initialEffects = []
  }
  const [value, setValue] = useState(initialValue)
  const [effects, setEffects] = useState(initialEffects)

  useUpdateEffect(() => {
    setChar({ [type]: { effects, value } })
  }, [value, effects])

  let choices = getChoices(type)
  if (!choices?.length) {
    return null
  }

  const choiceElms = choices.map((c, key) => (
    <span className="subtle" key={key}>
      {c}
    </span>
  ))
  return (
    <div>
      {["Välj mellan ", joinArray(choiceElms), "."]}
      <div>
        <div className="w-72 h-8 flex mb-2">
          <DropdownCombobox
            className="border"
            items={choices}
            onChange={(e) => {
              setValue(e)
            }}
            value={value}
          />
        </div>
        <EffectList
          effects={effects}
          onChange={(e) => {
            setEffects((effects) => effects.concat(e))
          }}
        />
      </div>
    </div>
  )
}

export function getChoices(type: Types) {
  if (type === "tribe") {
    return TRIBES
  } else if (type === "archetype") {
    return ARCHETYPES
  } else if (type === "environment") {
    return ENVIRONMENT
  }
}
