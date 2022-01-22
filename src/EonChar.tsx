import { useContext, useEffect, useState } from "react"
import { AttributeGroup } from "./AttributeAdderRow"
import { EffectList } from "./EffectList"
import { EonChoice } from "./EonChoice"
import { EonContacts } from "./EonContacts"
import { EonEvents } from "./EonEvents"
import { EonNotes } from "./EonNotes"
import { EonPossessions } from "./EonPossessions"
import { EonSkillList } from "./EonSkillList"
import { GlobalData } from "./contexts"
import { ATTRIBUTES, ATTRIBUTES_SECONDARY } from "./data"
import { useSavedCharacterData } from "./hooks/use-saved-character-data"
import type { Char } from "./types"

export const DefaultCharacterStore: Char = {
  Avtrubbning: {
    Utsatthet: 0,
    Våld: 0,
    Övernaturligt: 0,
  },
  Färdigheter: [
    { name: "Slagsmål", value: 0 },
    { name: "Undvika", value: 0 },
  ],
}

export default function EonChar() {
  const { char, clearChar, setChar } = useSavedCharacterData()

  // const events: any[] = char["händelser"]

  // New character button
  // Load character button
  // Add image button
  // Export data / publish character button
  if (!char) {
    return null
  }
  return (
    <GlobalData.Provider value={[char, setChar]}>
      <div className="p-8 space-y-6">
        <h1>Eon karaktärsskapare</h1>
        <div>
          <button
            className="hover:bg-gray-300 py-2 px-4 rounded bg-gray-100 border shadow-sm"
            onClick={() => {
              if (!window.confirm("Are you sure?")) return
              clearChar()
            }}
            type="button"
          >
            Rensa sparad data
          </button>
        </div>
        <EonCreationStep name="Bakgrund">
          <EonBackground />
        </EonCreationStep>
        <EonCreationStep name="Arketyp">
          <EonChoice type="archetype" />
        </EonCreationStep>
        <EonCreationStep name="Folkslag">
          <EonChoice type="tribe" />
        </EonCreationStep>
        <EonCreationStep name="Miljö">
          <EonChoice type="environment" />
        </EonCreationStep>
        <EonCreationStep name="Händelser">
          <EonEvents />
        </EonCreationStep>
        <EonCreationStep name="Grundattribut">
          <AttributeGroup attributes={ATTRIBUTES.map((name) => ({ name }))} />
        </EonCreationStep>
        <EonCreationStep name="Härledda attribut">
          <AttributeGroup
            attributes={ATTRIBUTES_SECONDARY.map((name) => ({ name }))}
          />
        </EonCreationStep>
        <EonCreationStep name="Avtrubbning">
          <EonMentalTrauma />
        </EonCreationStep>
        <EonCreationStep name="Färdigheter">
          <EonSkillList />
        </EonCreationStep>
        <EonCreationStep name="Ägodelar">
          <EonPossessions />
        </EonCreationStep>
        <EonCreationStep name="Kontakter">
          <EonContacts />
        </EonCreationStep>
        <EonCreationStep name="Övriga anteckningar">
          <EonNotes />
        </EonCreationStep>
      </div>
    </GlobalData.Provider>
  )
}
function EonBackground() {
  const [char, setChar] = useContext(GlobalData)
  const [number, setNumber] = useState(char?.Bakgrund?.number)
  const [name, setName] = useState(char?.Bakgrund?.name)
  const [effects, setEffects] = useState(char?.Bakgrund?.effects)
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
        // effects={effects}
        onChange={(e) => {
          // setEffects((effects) => ({ ...effects, ...e }))
        }}
      />
    </div>
  )
}

function EonCreationStep(props: {
  children?: JSX.Element | JSX.Element[]
  isCollapsed?: boolean
  name: string
}) {
  const [isCollapsed, setCollapsed] = useState(
    props.isCollapsed === undefined ? false : props.isCollapsed,
  )
  let hidden = isCollapsed ? { style: { display: "none" } } : {}
  let collapsedStatus = isCollapsed ? " ▸" : " ▾"
  return (
    <div>
      <h2>
        <button onClick={() => setCollapsed(!isCollapsed)} type="button">
          {props.name}
          {collapsedStatus}
        </button>
      </h2>
      <div {...hidden}>{props.children}</div>
    </div>
  )
}

function EonMentalTrauma() {
  const names = ["Utsatthet", "Våld", "Övernaturligt"]
  const rows = names.map((name, key) => (
    <span key={key}>
      <strong>{name}</strong>
      <input className="ml-2 mr-4 w-8" type="number" />
    </span>
  ))
  return <div>{rows}</div>
}
