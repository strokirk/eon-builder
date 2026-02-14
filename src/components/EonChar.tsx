import { useState } from "react"

import { GlobalData } from "../contexts"
import { ATTRIBUTES } from "../data"
import { formatExport } from "../export"
import { useSavedCharacterData } from "../hooks/use-saved-character-data"
import { AttributeGroup, SecondaryAttributeGroup } from "./EonAttributes"
import { EonBackground } from "./EonBackground"
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
      <div className="panel space-y-4">
        <h1>Eon karaktärsskapare</h1>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn--secondary"
            onClick={() => {
              exportChar()
            }}
            type="button"
          >
            Exportera
          </button>
          <button
            className="btn btn--danger"
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
        <TogglableSection id="eon4-background" name="Bakgrund">
          <EonBackground />
        </TogglableSection>
        <TogglableSection id="eon4-environment" name="Miljö">
          <EonChoice type="environment" />
        </TogglableSection>
        <TogglableSection id="eon4-archetype" name="Arketyp">
          <EonChoice type="archetype" />
        </TogglableSection>
        <TogglableSection id="eon4-tribe" name="Folkslag">
          <EonChoice type="tribe" />
        </TogglableSection>
        <TogglableSection id="eon4-events" name="Händelser">
          <EonEvents />
        </TogglableSection>
        <TogglableSection id="eon4-skills" name="Färdigheter">
          <EonSkillList />
        </TogglableSection>
        <TogglableSection id="eon4-primary-attributes" name="Grundattribut">
          <AttributeGroup attributes={ATTRIBUTES} />
        </TogglableSection>
        <TogglableSection id="eon4-secondary-attributes" name="Härledda attribut">
          <SecondaryAttributeGroup />
        </TogglableSection>
        <TogglableSection id="eon4-trauma" name="Avtrubbning">
          <EonMentalTrauma />
        </TogglableSection>
        <TogglableSection id="eon4-contacts" name="Kontakter">
          <EonEntityGroup type="contacts" />
        </TogglableSection>
        <TogglableSection id="eon4-possessions" name="Ägodelar">
          <EonEntityGroup type="possessions" />
        </TogglableSection>
        <TogglableSection id="eon4-notes" name="Övriga anteckningar">
          <EonEntityGroup type="notes" />
        </TogglableSection>
      </div>
    </GlobalData.Provider>
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
  return <div className="space-y-2">{rows}</div>
}