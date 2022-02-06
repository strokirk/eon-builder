import { useContext, useEffect, useState } from "react"

import { AttributeGroup } from "./AttributeAdderRow"
import { EffectData, EffectList } from "./EffectList"
import { EonChoice } from "./EonChoice"
import { EonContacts } from "./EonContacts"
import { EonEvents } from "./EonEvents"
import { EonNotes } from "./EonNotes"
import { EonPossessions } from "./EonPossessions"
import { EonSkillList } from "./EonSkillList"
import { TogglableSection } from "./TogglableSection"
import { GlobalData } from "./contexts"
import { ATTRIBUTES, ATTRIBUTES_SECONDARY } from "./data"
import { useSavedCharacterData } from "./hooks/use-saved-character-data"
import type { Char } from "./types"

export default function EonChar() {
  const [exportData, setExportData] = useState("")
  const { char, clearChar, setChar } = useSavedCharacterData()

  // New character button
  // Load character button
  // Add image button
  function exportChar() {
    setExportData(formatExport(char))
  }

  return (
    <GlobalData.Provider value={[char, setChar]}>
      <div className="p-8 space-y-6">
        <h1>Eon karaktärsskapare</h1>
        <div className="space-x-4">
          <button
            className="hover:bg-gray-300 py-2 px-4 rounded bg-gray-100 border shadow-sm"
            onClick={() => {
              exportChar()
            }}
            type="button"
          >
            Exportera
          </button>
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
        {exportData.length !== 0 && <pre className="">{exportData}</pre>}
        <TogglableSection name="Bakgrund">
          <EonBackground />
        </TogglableSection>
        <TogglableSection name="Miljö">
          <EonChoice type="environment" />
        </TogglableSection>
        <TogglableSection name="Arketyp">
          <EonChoice type="archetype" />
        </TogglableSection>
        <TogglableSection name="Folkslag">
          <EonChoice type="tribe" />
        </TogglableSection>
        <TogglableSection name="Händelser">
          <EonEvents />
        </TogglableSection>
        <TogglableSection name="Grundattribut">
          <AttributeGroup attributes={ATTRIBUTES.map((name) => ({ name }))} />
        </TogglableSection>
        <TogglableSection name="Härledda attribut">
          <AttributeGroup
            attributes={ATTRIBUTES_SECONDARY.map((name) => ({ name }))}
          />
        </TogglableSection>
        <TogglableSection name="Avtrubbning">
          <EonMentalTrauma />
        </TogglableSection>
        <TogglableSection name="Färdigheter">
          <EonSkillList />
        </TogglableSection>
        <TogglableSection name="Ägodelar">
          <EonPossessions />
        </TogglableSection>
        <TogglableSection name="Kontakter">
          <EonContacts />
        </TogglableSection>
        <TogglableSection name="Övriga anteckningar">
          <EonNotes />
        </TogglableSection>
      </div>
    </GlobalData.Provider>
  )
}
function EonBackground() {
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

function formatExport(char: Char): string {
  return `
Bakgrund: ${char.Bakgrund?.name}
Miljö: ${char.environment?.value}
Arketyp: ${char.archetype?.value}
Folkslag: ${char.tribe?.value}
Händelser:
${char.events?.map((e) => `${e.table} - ${e.number} - ${e.title}`).join("\n")}
`.trim()
}
