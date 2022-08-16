import { useContext, useEffect, useState } from "react"

import { GlobalData } from "../contexts"
import { ATTRIBUTES } from "../data"
import { formatExport } from "../export"
import { useSavedCharacterData } from "../hooks/use-saved-character-data"
import { EffectData, EffectList } from "./EffectList"
import { AttributeGroup, SecondaryAttributeGroup } from "./EonAttributes"
import { EonChoice } from "./EonChoice"
import { EonEntityGroup } from "./EonEntityGroup"
import { EonEvents } from "./EonEvents"
import { EonSkillList } from "./EonSkillList"
import { TogglableSection } from "./TogglableSection"

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
        {false && (
          // TODO:
          <TogglableSection name="Expertiser &amp; Kännetecken"></TogglableSection>
        )}
        <TogglableSection name="Färdigheter">
          <EonSkillList />
        </TogglableSection>
        <TogglableSection name="Grundattribut">
          <AttributeGroup attributes={ATTRIBUTES} />
        </TogglableSection>
        <TogglableSection name="Härledda attribut">
          <SecondaryAttributeGroup />
        </TogglableSection>
        <TogglableSection name="Avtrubbning">
          <EonMentalTrauma />
        </TogglableSection>
        <TogglableSection name="Ägodelar">
          <EonEntityGroup type="possessions" />
        </TogglableSection>
        <TogglableSection name="Kontakter">
          <EonEntityGroup type="contacts" />
        </TogglableSection>
        <TogglableSection name="Övriga anteckningar">
          <EonEntityGroup type="notes" />
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
    <div key={key}>
      <label className="space-x-2">
        <input className="w-8" type="number" />
        <strong>{name}</strong>
      </label>
    </div>
  ))
  return (
    <div className="space-y-2">
      {rows}
      <div>Välmående</div>
    </div>
  )
}
